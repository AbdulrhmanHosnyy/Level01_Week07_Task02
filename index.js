const https = require('https');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getRepositories(username, callback) {
  const options = {
    hostname: 'api.github.com',
    path: `/users/${username}/repos`,
    method: 'GET',
    headers: { 'User-Agent': 'node.js' }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const repos = JSON.parse(data);
        callback(null, repos);
      } catch (error) {
        callback(error);
      }
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.end();
}

function saveToFile(username, repos) {
  const fileName = `${username}.txt`;
  const repoNames = repos.map(repo => repo.name).join('\n');
  fs.writeFile(fileName, repoNames, (err) => {
    if (err) {
      console.error('Error writing to file:', err.message);
    } else {
      console.log(`Repositories saved to ${fileName}`);
    }
  });
}

function main() {
  rl.question('Enter GitHub username: ', (username) => {
    if (username.trim()) {
      getRepositories(username, (error, repos) => {
        if (error) {
          console.error('Error fetching repositories:', error.message);
        } else {
          saveToFile(username, repos);
        }
        rl.close();
      });
    } else {
      console.log('Username cannot be empty.');
      rl.close();
    }
  });
}

main();
