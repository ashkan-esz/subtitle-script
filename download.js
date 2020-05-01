const fs = require('fs');
const Path = require('path');
const axios = require('axios');

module.exports = async function download(full_name, url) {

    try {
        let spitted_url = url.split('.');
        let subtitle_format = spitted_url[spitted_url.length - 1];
        let spitted_fullName = full_name.split('.');
        spitted_fullName[spitted_fullName.length - 1] = subtitle_format;
        let subtitle_file_name = spitted_fullName.join('.');

        const path = Path.resolve(__dirname, 'downloaded', subtitle_file_name);
        const writer = fs.createWriteStream(path)

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