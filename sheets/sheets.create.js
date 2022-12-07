const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./accountservicecredentials.json');

async function main() {
  const doc = new GoogleSpreadsheet(
    '1F4hAsQUHCxUupGnXo5GlgI1MrLir6xRYLPja800Jvfc',
  );
  await doc.useServiceAccountAuth(creds);
  console.log(creds);

  // create a sheet and set the header row
  const sheet = await doc.addSheet({
    headerValues: ['artist', 'trackName', 'album', 'fromPlaylist'],
    title: new Date().toLocaleDateString('fr'),
  });

  // append rows
  const larryRow = await sheet.addRow({
    name: 'Larry Page',
    email: 'larry@google.com',
  });
  const moreRows = await sheet.addRows([
    { name: 'Sergey Brin', email: 'sergey@google.com' },
    { name: 'Eric Schmidt', email: 'eric@google.com' },
  ]);

  // read rows
  const rows = await sheet.getRows(); // can pass in { limit, offset }

  // read/write row values
  console.log(rows[0].name); // 'Larry Page'
  rows[1].email = 'sergey@abc.xyz'; // update a value
  await rows[1].save(); // save updates
  await rows[1].delete(); // delete a row
}
main();

// async function main() {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: 'accountservicecredentials.json',
//     scope: 'https://www.googleapis.com/auth/spreadsheets',
//   });

//   const client = await auth.getClient();

//   const googleSheets = google.sheets({ version: 'v4', auth: client });
//   const sheet = await doc.addSheet({ headerValues: ['name', 'email'] });
//   const spreadSheetsId = '1F4hAsQUHCxUupGnXo5GlgI1MrLir6xRYLPja800Jvfc'

//   await googleSheets.spreadsheets.values.append({
//     auth,
//     spreadsheetId,
//     range: "Sheet1!A:B",
//     valueInputOption: "USER_ENTERED",
//     resource: {
//       values: [[request, name]],
//     },
//   });
// }
// main();
