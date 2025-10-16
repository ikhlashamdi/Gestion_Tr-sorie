const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


exports.sendUserCreatedEmail = async (to, name, password) => { 
    try {
        const mailOptions = {
            from: `"Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Votre compte a été créé",
            html: `
                <h2>Bonjour ${name},</h2>
                <p>Un compte vient d’être créé pour vous par l’administrateur.</p>
                <p>Voici vos identifiants pour vous connecter :</p>
                <p><strong>Email :</strong> ${to}</p>
                <p><strong>Mot de passe :</strong> ${password}</p>
                <p>Vous pouvez vous connecter ici : <a href="${process.env.FRONTEND_URL}/login">Se connecter</a></p>
                <p>L’équipe</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email envoyé :", info.response);
    } catch (error) {
        console.error("⚠️ Échec d'envoi de l'email à", to, ":", error.message);
    }
};