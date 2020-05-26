const fs = require('fs');
const axios = require('axios');

module.exports = async function download(full_name, url) {

    try {
        let spitted_url = url.split('.');
        let subtitle_format = spitted_url.pop();
        let subtitle_file_name = full_name + '.' + subtitle_format;

        const writer = fs.createWriteStream(subtitle_file_name);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        })

        response.data.pipe(writer)
    } catch (e) {
        console.log(e)
    }
}