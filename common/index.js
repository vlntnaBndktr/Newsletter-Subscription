import 'dotenv/config'; //andere Variante um dotenv einzubinden
import fs from 'fs';
import { parse } from 'csv-parse'; //(ASYNC)
import dns from 'dns';
import crypto from 'crypto';

// DNS Check: MX Eintrag der Email Adresse vorhanden?
const checkDns = (mail) => {
  return new Promise((resolve, reject) => {
    const domain = mail.split('@')[1];

    // console.log(domain);

    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        console.error(
          `Für die angegebene E-Mail-Adresse konnte kein MX-Eintrag gefunden werden.`
        );
        reject(false); // Kein MX-Eintrag gefunden
      } else {
        // console.log('MX-Eintrag gefunden');
        resolve(true); // MX-Eintrag gefunden
      }
    });
  });
};

// Bestätigungscode erzeugen mit Crypto Library:
// (oder einfach mit math.random. Crypto.getRandomValues() NUR IM BROWSER möglich.

function generateSecureString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

// req-Daten in CSV Datei eintragen:
const writeInCSV = (data, confirmationCode) => {
  const csvContent = `${data.username},${data.email},${confirmationCode}\n`;

  try {
    fs.appendFileSync('data/newsletter-subscriptions.csv', csvContent);
    // console.log('Daten erfolgreich in die CSV-Datei geschrieben:', csvContent);
  } catch (error) {
    console.error('Fehler beim Schreiben der Datei:', error);
  }
};

const readSubscribers = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('data/newsletter-subscriptions.csv', 'utf8', (error, data) => {
      if (error) {
        return reject(error);
      }

      parse(
        data,
        {
          columns: true,
          skip_empty_lines: true,
        },
        (err, subscribers) => {
          if (err) {
            return reject(err);
          }

          resolve(subscribers);
        }
      );
    });
  });
};

// Prüfen ob email-Adresse schon vorhanden ist:
const subscriberExists = (subscribers, email) => {
  //wenn aus der readSubscribers hervorggeht, dass die email bereits in der
  //csv Datei vorkommt early return + Info an Client
  if (subscribers.findIndex((element) => element.email === email) > -1) {
    return true;
  }
  return false;
};

export {
  checkDns,
  generateSecureString,
  writeInCSV,
  readSubscribers,
  subscriberExists,
};
