const axios = require('axios').default;
const cheerio = require('cheerio');
const search_in_source = require('./search_in_source');
const download = require('./download');

module.exports = async function search_for_download_link(full_name,name, type) {

    try {
        const page_link = await search_in_source(name,type);
        if (page_link===null) return null;
        const response = await axios.get(page_link);
        let $ = cheerio.load(response.data);
        let links = $("a");
        if (type === 'movie')
             search_movie(full_name,name, $, links);
        else search_serial(full_name,name, $, links)
    } catch (e) {
        console.log('error in ' + name);
        return null;
    }
}

function search_movie(full_name, name, $, links) {
    let result = null;
    for (let i = 0, l = links.length; i < l; i++) {
        let downloadLink = $(links[i]).attr("href");
        if (downloadLink !== undefined && downloadLink !== null) {
            let temp = downloadLink;
            downloadLink = downloadLink.toLowerCase();
            if ((downloadLink.includes(name) ||
                downloadLink.split('.').join(' ').split('-').join(' ').includes(name)) &&
                (downloadLink.includes('.rar') || downloadLink.includes('.zip') ||
                    downloadLink.includes('.txt') || downloadLink.includes('.srt'))) {

                result = temp;
                break;
            }
        }
    }

    if (result !== null)
        download(full_name, result);
}

function search_serial(name,$,links) {
    let foundLink = false;
    let episode = 1;
    for (let i = 0, l = links.length; i < l; i++) {
        let downloadLink = $(links[i]).attr("href");
        if (downloadLink !== undefined && downloadLink !== null) {
            let temp = downloadLink;
            downloadLink = downloadLink.toLowerCase();
            if ((downloadLink.includes(name) || downloadLink.split('.').join('').includes(name)) &&
                (downloadLink.includes('.rar') || downloadLink.includes('.zip') ||
                    downloadLink.includes('.txt') || downloadLink.includes('.srt'))) {
                let text = fullName + " ";
                let flag = false;
                if (EPISODE !== null) episode = EPISODE;
                let algo1 = (season < 10) ? 's0' + season : 's' + season;
                let algo2 = algo1 + ((episode < 10) ? 'e0' + episode : 'e' + episode);
                if (downloadLink.includes(algo2)) {
                    text += algo2;
                    episode++;
                    flag = true;
                } else if (downloadLink.includes(algo1) && !downloadLink.includes(algo1 + "e")) {
                    text += algo1;
                    flag = true;
                }
                if (flag) {
                    div.innerHTML += `<div class="padded-top-less">
                                    <button class="btn">
                                         <a href="${temp}" download="${temp}"> <strong>${text}</strong></a>
                                     </button>
                                  </div>`;
                    foundLink = true;
                    if (EPISODE !== null) break;
                }
            }
        }
    }

    return foundLink;
}

