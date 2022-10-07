// ==UserScript==
// @name         Son Depremler Tablosu - Table of Latest Earthquakes
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Son depremler sayfasını tabloya dönüştürür. Converts raw textual data into interactive table (Rows are sortable by different columns via clicking on headers).
// @author       midnightBlueNebula
// @match        http://www.koeri.boun.edu.tr/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function getLocation(row){
      var location = "";
      let i = 8;
      while(i < (row.length-1)){
        location += row[i] + " ";
        i++;
      }
      return location;
    }


    function getMagnitude(magObj){
        if(magObj.mw && magObj.mw.match(/\d/)){
            return magObj.mw;
        }

        if(magObj.ml && magObj.ml.match(/\d/)){
            return magObj.ml;
        }

        return magObj.md;
    }


    function convertDateToNumber(dateStr){
        var dateArr = dateStr.split(/\s/);
        dateStr = dateArr[1] + dateArr[0];
        return Number(dateStr.replace(/(:)|(\.)/g, ""));
    }


    function latest(dateStr1, dateStr2){
        return convertDateToNumber(dateStr1) > convertDateToNumber(dateStr2);
    }


    function oldest(dateStr1, dateStr2){
        return convertDateToNumber(dateStr1) < convertDateToNumber(dateStr2);
    }


    const pre = document.querySelector("pre");
    const data = pre.innerText.split(/\n/);
    var objArray = data.map(d => { let row = d.split(/\s/).filter(s => s != ""); return { "tarih": row[1] + " " + row[0],
                                                                                          "enlem": row[2],
                                                                                          "boylam": row[3],
                                                                                          "derinlik": row[4],
                                                                                          "büyüklük": getMagnitude({ md: row[5], ml: row[6], mw: row[7] }),
                                                                                          "yer": getLocation(row),
                                                                                          "çözüm niteliği": row[row.length-1] } }).slice(6, -2);

    const table = document.createElement("table");
    table.style.textAlign = "center";
    document.body.insertBefore(table, document.body.firstChild);
    const thead = document.createElement("thead");
    table.appendChild(thead);
    thead.innerHTML = "<th>TARİH</th><th>ENLEM (KUZEY)</th><th>BOYLAM (DOĞU)</th><th>DERİNLİK (KM)</th><th>BÜYÜKLÜK</th><th>YER</th><th>ÇÖZÜM NİTELİĞİ</th>";
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    function tableAdapter(enumarableData){
        tbody.innerHTML = "";
        enumarableData.forEach(obj => {
            const tr = document.createElement("tr");
            tbody.appendChild(tr);
            tr.innerHTML = `<td title="TARİH">${obj["tarih"]}</td><td title="ENLEM">${obj["enlem"]}</td><td title="BOYLAM">${obj["boylam"]}</td><td title="DERİNLİK">${obj["derinlik"]}</td><td title="BÜYÜKLÜK">${obj["büyüklük"]}</td><td title="YER">${obj["yer"]}</td><td title="ÇÖZÜM NİTELİĞİ">${obj["çözüm niteliği"]}</td>`;
        })
    }

    tableAdapter(objArray);

    var lastRow;
    document.addEventListener("mouseover", (event) => {
        if(lastRow) {
            lastRow.style.backgroundColor = "inherit";
            lastRow.style.color = "black";
        } if(event.target.tagName == "TD") {
            event.target.parentElement.style.backgroundColor = "blue";
            event.target.parentElement.style.color = "white";
            lastRow = event.target.parentElement;
        }
    });

    var lastSort = { "TARİH": true };
    function switchSort(key){
        if(lastSort[key]){
            lastSort[key] = false;
        } else {
            lastSort = {};
            lastSort[key] = true;
        }
    }

    document.addEventListener("click", (event) => {
        if(event.target.tagName == "TH") {
            const key = event.target.innerText.replace(/\s/, "");
            const sortOpt = lastSort[key];

            if(key.match("TARİH")){
                if(sortOpt){
                    tableAdapter(objArray.sort((a, b) => latest(a["tarih"], b["tarih"])));
                } else {
                    tableAdapter(objArray.sort((a, b) => oldest(a["tarih"], b["tarih"])));
                }
            } else if(key.match("BÜYÜKLÜK")){
                if(sortOpt){
                    tableAdapter(objArray.sort((a, b) => Number(a["büyüklük"]) > Number(b["büyüklük"])));
                } else {
                    tableAdapter(objArray.sort((a, b) => Number(a["büyüklük"]) < Number(b["büyüklük"])));
                }
            } else if(key.match("DERİNLİK")){
                if(sortOpt){
                    tableAdapter(objArray.sort((a, b) => Number(a["derinlik"]) > Number(b["derinlik"])));
                } else {
                    tableAdapter(objArray.sort((a, b) => Number(a["derinlik"]) < Number(b["derinlik"])));
                }
            }

            switchSort(key);
        }
    })
})();
