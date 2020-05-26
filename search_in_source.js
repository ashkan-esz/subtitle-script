const axios = require('axios').default;
const cheerio = require('cheerio');
const sources = require('./sources');

module.exports = async function search_in_source(spitted_name, type, source_index = 0) {
    let searching_item;
    if (spitted_name.length === 1)
        searching_item = 'the+' + spitted_name;
    else searching_item = spitted_name.join('+');
    let downloadPage = null;
    try {
        const response = await axios.get(`${sources[source_index]}${searching_item}`)
        let $ = cheerio.load(response.data);
        let links = $("a");

        for (let i = 0, l = links.length; i < l; i++) {
            let webPageLink = $(links[i]).attr("href");
            let innerText = $(links[i]).text();

            if (webPageLink !== undefined && webPageLink !== null &&
                innerText !== null && innerText !== undefined && innerText !== "") {
                innerText = innerText.toLowerCase().split(" ");
                let spitted_innerText = innerText.map((text) => text.replace(/\s|:|’/g, ""));
                if (checkTitle(spitted_name, type, spitted_innerText)) {
                    downloadPage = webPageLink;
                    break;
                }
            }
        }

        if (downloadPage === null) {
            if (source_index < sources.length - 1) {
                return await search_in_source(spitted_name, type,source_index + 1);
            } else return null;
        } else return downloadPage;

    } catch (e) {
        console.log('error while search_in_source in ' + name);
        console.log(e);
        if (source_index < sources.length - 1) {
            return await search_in_source(spitted_name, type,source_index + 1);
        } else return null;
    }
}

function checkTitle(spitted_name, type, spitted_innerText) {
    if (type === 'movie') {
        for (let i = 0, l = spitted_name.length; i < l; i++) {
            if (!spitted_innerText.includes(spitted_name[i]) &&
                !spitted_innerText.includes(spitted_name[i] + 's')) {
                return false;
            }
        }
    } else {
        for (let i = 0, l = spitted_name.length; i < l; i++) {
            if (!spitted_innerText.includes(spitted_name[i])) {
                return false;
            }
        }
    }
    return true;
}