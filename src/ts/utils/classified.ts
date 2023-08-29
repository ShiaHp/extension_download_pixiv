import { Artwork } from './../interface/artwork';
import { API } from "./api";

export const idPixiv = /\/(\d+)_p\d+_[\w-]+\d+\.(jpg|png|gif|bmp|jpeg|webp)$/i;
export const idTweet = /[0-9]{19,21}/;
export const format_pixiv: number = 0;
export const format_twitter: number = 1;

export interface ExtraNode extends Node {
  tagName: string;
  currentSrc: string;
}
export class Utils {
  static isPixiv(name: string): number {
    let isPixiv: boolean = name.indexOf("pixiv") > -1;
    return isPixiv ? 0 : 1;
  };

  static getIdArtWork(url: string): string {
    return url.match(idPixiv)[1]
  };

  static async getDataUrl(url: string): Promise<Artwork> {
    const id = this.getIdArtWork(url);
    const data = await API.getArtwork(id);
    return data || {};
  };

  static async checkData(url: string) {
    return this.getDataUrl(url).then((data) => data);
  };

  static classifiedPageCount(arkwork: Artwork): string[] {
    const urlArr: string[] = [];
    const pageCount = arkwork?.body?.pageCount;
    const img = arkwork?.body?.urls.original
    if (pageCount <= 1 && arkwork) {
      urlArr.push(img);
    } else {
      for (let i = 0; i < pageCount; i++) {
        const url = `${img}`.replace("_p0", `_p${i}`);
        urlArr.push(url);
      }
    }
    return urlArr;
  };

  static isImageNode(node: ExtraNode) {
    return node?.tagName === 'IMG' && node instanceof Element;
  }
}



