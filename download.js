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

        response.data.pipe(writer);
        let spitted_full_name = full_name.split('.');
        let show_text = [];
        for (let i = 0; i < spitted_full_name.length && i < 3 ; i++) {
            show_text.push(spitted_full_name[i]);
        }
        show_text = show_text.join('.');
        console.log(`--------start downloading ${show_text} `);
        console.log();
        writer.on('finish',()=>console.log(`++++++++ ${show_text}  done!`));
    } catch (e) {
        console.log(e)
    }
}