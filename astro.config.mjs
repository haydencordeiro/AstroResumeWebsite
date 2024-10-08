import { defineConfig } from 'astro/config';
import fs from 'fs';
import fetch from 'node-fetch';
import sitemap from "@astrojs/sitemap";
import path from 'path';

async function  getPageIds(){
  const response = await fetch("https://api.notion.com/v1/databases/3db8fe9ff1ab4b5ba2b427059834759b/query", {
        body: "{}",
        headers: {
          Authorization: "Bearer "+ import.meta.env.VITE_NOTION_API_TOKEN,
          "Content-Type": "application/json",
          "Notion-Version": "2022-02-22"
        },
        method: "POST"
      });
  
  const data = await response.json();
  return (data.results.map((r) => r.id))
  }

  const slugify = str =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

  async function downloadImage(url, filename) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    
    fs.writeFileSync(path.join('./src/assets/img/dynamic/', filename), buffer);
    fs.writeFileSync(path.join('./public/assets/', filename), buffer);
}

async function getPageData(pageID){
  var myHeaders = new Headers();
  myHeaders.append("Notion-Version", "2022-02-22");
  myHeaders.append("Authorization", "Bearer "+ import.meta.env.VITE_NOTION_API_TOKEN);
  myHeaders.append("Cookie", "__cf_bm=WOKP4K9Z2mcTJP4t.rOvEU2RCoecmWDxu_mOFMj7PeY-1702757076-1-AWhJI19kMpOkGvqYCq3q4FHTPseRH5nz5RXOfGC1a61W9goA9CXgRaB1zQ+gPRlYkTULyrTnT2E1KgUiEVVQAzU=");
  
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
  
  const response = await fetch("https://api.notion.com/v1/pages/"+pageID , requestOptions)
  const data = await response.json();
  let imgURL = data.properties.thumbnail.url ? data.properties.thumbnail.url : "https://ik.imagekit.io/haydencordeiro/JetChat_E4Z1UHU9l.png?updatedAt=1702754118556";
  const imgFilename = `${slugify(data.properties.Name.title[0].text.content)}.png`;

    // Download and save the image locally
  await downloadImage(imgURL, imgFilename);

  const returnData = [
      `https://hayden.co.in/assets/${imgFilename}`
      // data.properties?.thumbnail?.url ? data.properties.thumbnail.url : "https://ik.imagekit.io/haydencordeiro/JetChat_E4Z1UHU9l.png?updatedAt=1702754118556",
      // data.properties?.Demo?.url,
      // data.properties?.projectLink?.url
  ]
  return returnData
  }
  
  
  let pageIds = (await getPageIds()).reverse()
  var pageIDS = Array.from(new Set(pageIds));
  const projects =  await Promise.all(pageIDS.map((pid) => getPageData(pid)))
  const flattenedprojects = projects.flat().filter(item => item !== null);


  // Add other default urls here
  flattenedprojects.push('https://hayden.co.in/assets/Hayden_Cordeiro_Resume.pdf')
  console.log(flattenedprojects)

// https://astro.build/config
export default defineConfig({
  site: 'https://hayden.co.in/',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date('2024-06-22'),
      customPages: flattenedprojects,
    }),
  ]
});