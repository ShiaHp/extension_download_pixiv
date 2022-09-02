import { API } from "../utils/api";
import {
  getImageUrl,
  clearImageUrl,
  getImageUrlOriginal,
} from "../utils/storage";
import { checkURL, idReg } from "../utils/checkUrl";

const myHeaders = new Headers();

myHeaders.append("sec-fetch-site", "cross-site");
myHeaders.append("referer", "https://www.pixiv.net/");
const requestOptions = {
  method: "GET",
  headers: myHeaders,
};

function downloadImage(url: string, msg = "undifined") {
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: "get",
      credentials: "same-origin",
      headers: myHeaders,
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `pixiv-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
      })
      .then(() => {
        if (msg === "undifined") {
          console.log("Shiawase ハンサム ")
        } else {
          chrome.runtime.sendMessage({ notification: "Close" });
        }
      })
      .catch((e) => {
        downloadImage(url);
        resolve(e);
        chrome.runtime.sendMessage({ notification: `reload-extension"` });
      });
  });
}
let imgIdArr = [];
const imagesArray = document.getElementsByTagName("img");
let myImage = document.createElement("img") as HTMLImageElement;
myImage.style.borderRadius = "5px";
myImage.style.border = "1px solid black";
myImage.style.padding = "5px";
myImage.style.width = "150px";
const buttonDownloadAll = document.createElement("button");
buttonDownloadAll.innerHTML = "Download all";
buttonDownloadAll.style.zIndex = "9999";
buttonDownloadAll.style.backgroundColor = "#52e010";
buttonDownloadAll.style.borderRadius = "5px";
buttonDownloadAll.style.fontSize = "18px";
buttonDownloadAll.style.alignContent = "center";
buttonDownloadAll.style.color = " #fff";
buttonDownloadAll.style.position = "fixed";
buttonDownloadAll.style.right = "0";
buttonDownloadAll.style.bottom = "350px";
buttonDownloadAll.style.padding = "0.5rem";
buttonDownloadAll.style.margin = "0.5rem 0.5rem 0.5rem 0";
buttonDownloadAll.style.transition = "0.2s all";
buttonDownloadAll.style.cursor = "pointer";
buttonDownloadAll.style.transform = "scale(0.98)";
buttonDownloadAll.style.boxShadow = "3px 2px 22px 1px rgba(0, 0, 0, 0.24)";
const body = document.getElementsByTagName("body")[0];
body.appendChild(buttonDownloadAll);
let linkImg = "";

setInterval(() => {
  for (let i = 2; i < imagesArray.length; i++) {
    if (
      imagesArray.length > 2 &&
      imagesArray[i].parentElement &&
      imagesArray[i].parentElement.childNodes &&
      imagesArray[i].parentElement.childNodes.length <= 1
    ) {
      // const tab = document.getElementsByTagName('li')

      // if (tab[i].className.includes("sc-9y4be5-2")) {
      //   liArr.push(tab[i].className.includes("sc-9y4be5-2"))
      // }

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "checkbox";

      checkbox.style.fontSize = "20px";
      checkbox.style.position = "absolute";
      checkbox.style.borderRadius = "5px";
      checkbox.style.zIndex = "9998";
      checkbox.style.top = "0px";
      checkbox.style.left = "0px";
      checkbox.style.height = "25px";
      checkbox.style.width = "25px";
      checkbox.style.backgroundColor = "rgba(255, 255, 255, 0.5rem)";

      const button = document.createElement("button");
      button.innerText = "\u21E9";
      button.style.zIndex = "9999";
      button.style.backgroundColor = "#52e010";
      button.style.borderRadius = "5px";
      button.style.fontSize = "18px";
      button.style.alignContent = "center";
      button.style.color = " #fff";
      button.style.position = "absolute";
      button.style.right = "0";
      button.style.top = "1rem";
      button.style.padding = "0.5rem";
      button.style.margin = "0.5rem 0.5rem 0.5rem 0";
      button.style.transition = "0.2s all";
      button.style.cursor = "pointer";
      button.style.transform = "scale(0.98)";
      button.style.opacity = "0.5rem";

      button.style.boxShadow = "3px 2px 22px 1px rgba(0, 0, 0, 0.24)";

      async function checkImage(url: string) {
        const count = await checkURL.checkManyPageCount(url);
        if (count <= 1) {
          const newUrl: any = await checkURL.checkURLmedium(url);

          downloadImage(newUrl);
        } else {
          const newUrl: any = await checkURL.checkURLmedium(url);
          for (let i = 0; i < count; i++) {
            const url = `${newUrl}`.replace("_p0", `_p${i}`);
            downloadImage(url);
          }
        }
      }

      checkbox.addEventListener("click", function (e) {
        e.stopPropagation();

        const id = e.path[1].innerHTML.match(idReg)[0];
        // check if the id is already in array
        if (imgIdArr.includes(id)) {
          const index = imgIdArr.indexOf(id);
          imgIdArr.splice(index, 1);
        } else {
          imgIdArr.push(id);
        }
      });

      imagesArray[i].addEventListener("mouseover", function (e) {
        myImage.src = this.src;
        linkImg = this.src;
      });

      button.onclick = function (e) {
        e.stopPropagation();
        e.preventDefault();
        checkImage(linkImg);
      };
      imagesArray[i].parentElement.appendChild(button);
      imagesArray[i].parentElement.appendChild(checkbox);
    }
  }
}, 100);

buttonDownloadAll.addEventListener("click", async function (e) {
  if (imgIdArr.length > 0) {
    const urlArr = [];

    const isAllCheck = false;
    Array.from(document.querySelectorAll("input[type=checkbox]")).forEach(
      (el) => (el.checked = isAllCheck)
    );
    for (let i = 0; i < imgIdArr.length; i++) {
      const data = await API.getArtwordData(imgIdArr[i]);
      if (data.body.pageCount <= 1) {
        urlArr.push(data.body.urls.original);
      } else {
        for (let i = 0; i < data.body.pageCount; i++) {
          const url = `${data.body.urls.original}`.replace("_p0", `_p${i}`);
          urlArr.push(url);
        }
      }
    }
    const response = urlArr.map((url) => {
      return downloadImage(url);
    });

    await Promise.all(response).then(() => {
      imgIdArr = [];
    });
  } else {
    alert("Please select artworks");
  }
});

getImageUrlOriginal().then(async (res) => {
  if (res.length > 0) {
    downloadImage(res, "Download");
  }
});

chrome.storage.local.get("arrUrl1", async function (res) {
  if (res || res.arrUrl1.length > 0) {
    const response = res.arrUrl1.map((url) => {
      return downloadImage(url);
    });
    await Promise.all(response);
  }
});

clearImageUrl();
