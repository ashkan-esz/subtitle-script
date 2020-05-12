const axios = require('axios').default;
const cheerio = require('cheerio');
const sources = require('./sources');

module.exports = async function search_in_source(spitted_name, type, source_index = 0) {
    const year = spitted_name[spitted_name.length - 1];
    let searching_item = spitted_name.join('+');
    searching_item = searching_item.replace('+'+year,'');
    let downloadPage = null;
    try {
        const response = await axios.get(`${sources[source_index]}${searching_item}`)
        let $ = cheerio.load(response.data);
        let links = $("a");

        for (let i = 0, l = links.length; i < l; i++) {
            let webPageLink = $(links[i]).attr("href");
            let innerText = $(links[i]).text();

            if (webPageLink !== undefined && webPageLink !== null &&
                innerText !== null && innerText !== undefined && innerText!=="") {
                innerText = innerText.toLowerCase().split(" ");
                let spitted_innerText = innerText.map((text)=>text.replace(/\s|:|’/g, ""));

                if (checkTitle(spitted_name, year, type, spitted_innerText)) {
                    let isUrl = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/.test(webPageLink);
                    if (isUrl) {
                        downloadPage = webPageLink;
                        break;
                    }
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

function checkTitle(spitted_name, year, type, spitted_innerText) {
    if (type === 'movie') {
        for (let i = 0, l = spitted_name.length; i < l; i++) {
            if ((!spitted_innerText.includes(spitted_name[i]) &&
                !spitted_innerText.includes(spitted_name[i] + 's'))
                && spitted_name[i] !== year) {
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