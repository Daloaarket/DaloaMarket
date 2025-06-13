// Netlify Function : Envoi d'email avec Resend pour les demandes de crédits
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

exports.handler = async (event) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Vérifier que le body existe
    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Corps de la requête manquant' })
      };
    }

    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Format JSON invalide' })
      };
    }

    const { 
      selectedPack, 
      phoneNumber, 
      email, 
      fullName, 
      screenshotBase64,
      screenshotFilename 
    } = requestData;

    // Validation des données
    if (!selectedPack || !phoneNumber || !email || !fullName || !screenshotBase64) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Données manquantes' })
      };
    }

    // Informations sur les packs
    const CREDIT_PACKS = {
      'starter': { name: 'Starter', credits: 3, price: 500 },
      'regular': { name: 'Regular', credits: 10, price: 1500 },
      'pro': { name: 'Pro', credits: 30, price: 3500 }
    };

    const packInfo = CREDIT_PACKS[selectedPack];
    if (!packInfo) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Pack invalide' })
      };
    }

    // Préparer l'email
    const emailSubject = `Demande d'achat de crédits - Pack ${packInfo.name}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF7F00, #FF9933); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #FF7F00; }
            .payment-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛍️ DaloaMarket - Demande d'achat de crédits</h1>
              <p>Nouvelle demande d'achat de pack de crédits</p>
            </div>
            
            <div class="content">
              <div class="info-box">
                <h3>📦 Informations du pack</h3>
                <p><strong>Pack sélectionné :</strong> ${packInfo.name}</p>
                <p><strong>Nombre de crédits :</strong> ${packInfo.credits}</p>
                <p><strong>Prix :</strong> ${packInfo.price} FCFA</p>
              </div>

              <div class="info-box">
                <h3>👤 Informations client</h3>
                <p><strong>Nom complet :</strong> ${fullName}</p>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Numéro débité :</strong> ${phoneNumber}</p>
              </div>

              <div class="payment-info">
                <h3>💳 Informations de paiement</h3>
                <p><strong>Montant :</strong> ${packInfo.price} FCFA</p>
                <p><strong>Numéro débité :</strong> ${phoneNumber}</p>
                <p><strong>Date de demande :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}</p>
              </div>

              <div class="info-box">
                <h3>📋 Actions à effectuer</h3>
                <ol>
                  <li>Vérifier la capture d'écran de transaction en pièce jointe</li>
                  <li>Confirmer le paiement sur Orange Money/MTN</li>
                  <li>Ajouter ${packInfo.credits} crédits au compte de ${email}</li>
                  <li>Envoyer un email de confirmation au client</li>
                </ol>
              </div>
            </div>

            <div class="footer">
              <p>DaloaMarket - Marketplace P2P de Daloa</p>
              <p>Email automatique généré le ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Préparer la pièce jointe (capture d'écran)
    const attachments = [];
    if (screenshotBase64) {
      // Extraire le type MIME et les données base64
      const matches = screenshotBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        
        attachments.push({
          filename: screenshotFilename || `transaction_${Date.now()}.jpg`,
          content: base64Data,
          type: mimeType,
          disposition: 'attachment'
        });
      }
    }

    // Envoyer l'email via Resend
    const emailData = {
      from: 'DaloaMarket <noreply@daloamarket.com>',
      to: ['daloamarket@gmail.com'],
      subject: emailSubject,
      html: emailHtml,
      attachments: attachments
    };

    console.log('Envoi email via Resend...');
    const result = await resend.emails.send(emailData);
    
    console.log('Email envoyé avec succès:', result);

    // Email de confirmation au client
    const confirmationEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF7F00, #FF9933); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .info-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #FF7F00; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Demande reçue avec succès !</h1>
              <p>Merci pour votre demande d'achat de crédits</p>
            </div>
            
            <div class="content">
              <div class="success-box">
                <h3>🎉 Votre demande a été envoyée !</h3>
                <p>Nous avons bien reçu votre demande d'achat du pack <strong>${packInfo.name}</strong> (${packInfo.credits} crédits).</p>
              </div>

              <div class="info-box">
                <h3>📋 Récapitulatif de votre commande</h3>
                <p><strong>Pack :</strong> ${packInfo.name}</p>
                <p><strong>Crédits :</strong> ${packInfo.credits}</p>
                <p><strong>Prix :</strong> ${packInfo.price} FCFA</p>
                <p><strong>Numéro débité :</strong> ${phoneNumber}</p>
              </div>

              <div class="info-box">
                <h3>⏰ Prochaines étapes</h3>
                <ol>
                  <li>Notre équipe va vérifier votre paiement dans les 24h</li>
                  <li>Une fois confirmé, vos crédits seront ajoutés à votre compte</li>
                  <li>Vous recevrez un email de confirmation</li>
                  <li>Vous pourrez alors publier vos annonces !</li>
                </ol>
              </div>

              <div class="info-box">
                <h3>📞 Besoin d'aide ?</h3>
                <p>Si vous avez des questions, n'hésitez pas à nous contacter :</p>
                <p><strong>Email :</strong> daloamarket@gmail.com</p>
                <p><strong>Téléphone :</strong> +225 07 88 00 08 31</p>
              </div>
            </div>

            <div class="footer">
              <p>Merci de faire confiance à DaloaMarket !</p>
              <p>L'équipe DaloaMarket - Daloa, Côte d'Ivoire</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email de confirmation au client
    await resend.emails.send({
      from: 'DaloaMarket <noreply@daloamarket.com>',
      to: [email],
      subject: `Confirmation - Demande de pack ${packInfo.name} reçue`,
      html: confirmationEmailHtml
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        message: 'Demande envoyée avec succès',
        emailId: result.id
      })
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Erreur lors de l\'envoi de la demande',
        details: error.message
      })
    };
  }
};