const axios = require('axios').default;
const cheerio = require('cheerio');
const sources = [
    "http://worldsubtitle.info/?s=",
    "https://esubtitle.com/?s="
];

module.exports = async function search_in_source(name, type, source_index = 0) {
    const spitted_name = name.split(" ");
    const searching_item = spitted_name.join('+');
    const year = spitted_name[spitted_name.length - 1];
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
                let spitted_innerText = innerText.map((text)=>text.replace(/\s/g, ""));

                if (checkTitle(spitted_name, year, type, spitted_innerText)) {
                    downloadPage = webPageLink;
                    break;
                }
            }
        }

        if (downloadPage === null) {
            if (source_index < sources.length) {
                return await search_in_source(name, type,source_index + 1);
            } else return null;
        } else return downloadPage;

    } catch (e) {
        console.log('error in ' + name);
        if (source_index < sources.length) {
            return await search_in_source(name, type,source_index + 1);
        } else return null;
    }
}

function checkTitle(spitted_name, year, type, spitted_innerText) {
    let flag = true;
    if (type === 'movie') {
        for (let i = 0, l = spitted_name.length; i < l; i++) {
            if (!spitted_innerText.includes(spitted_name[i]) && spitted_name[i] !== year) {
                flag = false;
                break;
            }
        }
    } else {
        for (let i = 0, l = spitted_name.length; i < l; i++) {
            if (!spitted_innerText.includes(spitted_name[i])) {
                flag = false;
                break;
            }
        }
    }
    return flag;
}