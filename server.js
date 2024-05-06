// import * as dotenv from 'dotenv';
import 'dotenv/config'; //andere Variante um dotenv einzubinden
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { body, validationResult, matchedData } from 'express-validator';
import nodemailer from 'nodemailer';

import {
  checkDns,
  generateSecureString,
  writeInCSV,
  readSubscribers,
  subscriberExists,
} from './common/index.js';

// dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Form body parser
app.use(express.urlencoded({ extended: true }));

// JSON parser
app.use(express.json());

app.use(cors());

app.listen(PORT, () => {
  console.log('Server läuft auf Port http://localhost:' + PORT);
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    },
  })
);

app.use('/', express.static('www'));

app.post(
  '/',
  [
    body('username').trim(),
    body('email').toLowerCase().normalizeEmail().isEmail(),
  ],
  async (req, res) => {
    //Checkbox gecheckt?
    if (req.body.checkbox !== true) {
      return res
        .status(403)
        .send('Bitte bestätigen Sie die Datenschutzrichtlinien.');
    }

    //Datenqualität prüfen syntaktisch:
    const result = validationResult(req); // = das Resultatobjekt d. Validierung inkl. Array mit Fehlern
    const validatedData = matchedData(req); // = nur die erfolgreich validierten und bereinigten Daten
    let confirmationCode; //schon in diesem Scope deklarieren für später
    // console.log('result: ', result);
    // console.log('validatedData: ', validatedData);

    //Bei Fehler in Datenqualität, Fehlermeldung + Info an Client senden
    if (result.errors.length > 0) {
      const wrongValue = result.errors[0].value;
      return res
        .status(422)
        .send(`Die angegebene E-mail Adresse(${wrongValue}) ist ungültig.`);
    }

    // Bei fehlendem MX Eintrag der Email-Adresse, Fehlermeldung + early return
    try {
      await checkDns(validatedData.email);
    } catch (error) {
      return res.status(422).send(`JUNK-EMAIL!!`);
    }

    // Prüfen ob e-mail Adresse schon vorhanden ist
    // validatedData mit csv-Daten vergleichen
    try {
      const subscribers = await readSubscribers(); // Auf das Ergebnis der Promise warten

      const emailExists = subscriberExists(subscribers, validatedData.email);

      if (emailExists) {
        //wenn bei subscriberExists true returned wird
        return res
          .status(409)
          .send(
            'Unser Newsletter wird bereits an die angegebene E-mail Adresse versendet. Bitte überprüfen Sie die Junk/Spam-Einstellungen in Ihrem Posteingang.'
          );
      }
      confirmationCode = generateSecureString(16);
      writeInCSV(validatedData, confirmationCode);
    } catch (error) {
      console.error(error);
      res.status(500).send('Ein interner Fehler ist aufgetreten.');
    }

    // 1. Absenderkonfiguration (createTransport): Create a Nodemailer transporter using either SMTP or some other transport mechanism
    const transporter = nodemailer.createTransport({
      host: process.env.mail_host,
      port: process.env.mail_port,
      // secure: true,
      auth: {
        user: process.env.mail_user,
        pass: process.env.mail_password,
      },
    });

    // HTML für Email erzeugen
    const html = `<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>confirmation-message</title>
    </head>
    <body
      style="
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        padding: 5%;
        margin-top: 5%;
        text-align: center;
      "
    >
      <div>
        <h2 style="color: #800020">Fast geschafft...</h2>
        <p>
          Bitte bestätigen Sie Ihre E-Mail-Adresse durch einen Klick auf folgenden
          Link:
        </p>
        <a
          class="confirmation-button"
          href="http://localhost:7001/newsletter-confirmation?code=${confirmationCode}&email=${validatedData.email}"
          target="_blank"
          style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #800020;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
          "
        >
          E-Mail Adresse bestätigen
        </a>
        <p>
          Falls der Button nicht funktioniert, können Sie den folgenden Link in
          die Adressleiste Ihres Browsers kopieren:
        </p>
  
        <a
          href="http://localhost:7001/newsletter-confirmation?code=${confirmationCode}&email=${validatedData.email}"
          target="_blank"
          style="text-decoration: none; display: block; margin-top: 10px"
        >
          http://localhost:7001/newsletter-confirmation?code=${confirmationCode}&email=${validatedData.email}
        </a>
      </div>
    </body>
  </html>
  `;

    // 2. Empfänger- und E-Mail-Konfiguration (sendMail()-Methode des vorher erzeugten Transporters)
    // Nachrichten-Objekt mit message options (who sends what to whom)
    try {
      const info = await transporter.sendMail({
        from: '"Valentina Benedikter 👻" <newsletter@pflichtuebung.com>', // sender address
        to: validatedData.email, // list of receivers
        subject: 'Anmeldung zum Newsletter ✔', // Subject line
        // text: 'Hello world text?', // plain text body
        html: html, // html body
      });

      console.log('Confirmation-email was sent sucessfully.');
    } catch (error) {
      console.error(error); // oder console.log(error);
      return res.status(500).send('Email could not be sent');
    }

    let successMessage = '';
    if (validatedData.username) {
      successMessage =
        '✔ Hallo ' +
        validatedData.username +
        '! Wir haben Ihnen soeben einen Bestätigungs-Link per mail gesendet.';
    } else {
      successMessage =
        '✔ Hallo! Wir haben Ihnen soeben einen Bestätigungs-Link per E-mail gesendet.';
    }

    res.json(successMessage);
  }
);

// Bestätigung der e-mail Adresse + confirmationCode
// GET-Request: mit Query-Parametern in der URL
app.get('/newsletter-confirmation', async (req, res) => {
  const { code, email } = req.query; //Variablen mit Destructuring holen

  if (!code || !email) {
    return res.status(400).send('Ungültige Anfrage. Fehlende Parameter.');
  }
  try {
    // CSV Datei auslesen
    const subscribers = await readSubscribers(); // Auf das Ergebnis der Promise warten
    // checken ob e-mail Adresse im file existiert
    const emailExists = subscriberExists(subscribers, email);

    if (!emailExists) {
      return res.status(404).send('E-Mail-Adresse nicht gefunden.');
    }
    // den Subscriber mit find in Variable speichern
    const subscriber = subscribers.find((sub) => sub.email === email);

    // confirmationCodes vergleichen
    if (subscriber.confirmationCode === code) {
      // Bestätigungscode stimmt überein - Anmeldung bestätigen
      return res.sendFile('www/newsletter-confirmation.html', { root: './' });
    } else {
      return res.status(403).send('Ungültiger Bestätigungscode.');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Ein interner Fehler ist aufgetreten.');
  }
});
