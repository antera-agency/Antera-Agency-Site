import { defineField, defineType } from 'sanity';

// Herbruikbaar video-object. Ondersteunt zowel een geüpload
// videobestand als een externe URL (YouTube, Vimeo, Cloudinary,
// etc). Als beide zijn ingevuld, geeft de frontend standaard
// voorrang aan het geüploade bestand — tenzij "Voorkeur voor URL"
// is aangevinkt. De daadwerkelijke prioriteitslogica staat in
// src/lib/video.ts aan de frontend-kant.
export default defineType({
  name: 'projectVideo',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'videoFile',
      title: 'Video-upload (MP4 of vergelijkbaar)',
      type: 'file',
      description:
        'Optie 1: upload een videobestand direct naar Sanity. Let op: Sanity comprimeert of optimaliseert video niet — het bestand wordt exact zo geserveerd als je het uploadt. Houd bestanden voor deze kleine reel-kaartjes bij voorkeur onder de 30-50MB (comprimeer vooraf, bijv. via HandBrake of een export op 720p). Voor grote bestanden (rond of boven 1GB) gebruik je beter optie 2 hieronder met een Cloudinary-link — Cloudinary optimaliseert en streamt video wél automatisch, wat hapering bij afspelen voorkomt.',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video-URL',
      type: 'url',
      description:
        'Optie 2: link naar YouTube, Vimeo, TikTok, Instagram (Reel/Post), Bunny Stream, Cloudinary of een andere videobron. Werkt naast of in plaats van een upload. Let op bij TikTok: gebruik de volledige video-URL, geen verkorte vm.tiktok.com-link. Let op bij Instagram: toont Instagram\'s eigen embed-kaart (met hun UI) — geen stille autoplay, de bezoeker moet zelf op play klikken; dit is een beperking van Instagram zelf. Bunny Stream: zowel de "Direct Play"-link (player.mediadelivery.net/play/...) als de embed-link (player.mediadelivery.net/embed/...) worden geaccepteerd — beide werken.',
      validation: (Rule) =>
        Rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'preferUrlOverFile',
      title: 'Voorkeur voor URL boven upload',
      type: 'boolean',
      description:
        'Sta uit (standaard): als beide zijn ingevuld, wordt het geüploade bestand getoond. Zet aan om in plaats daarvan de URL te tonen.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      file: 'videoFile.asset.originalFilename',
      url: 'videoUrl',
    },
    prepare({ file, url }) {
      return {
        title: file || url || 'Geen video ingesteld',
        subtitle: file && url ? 'Upload + URL aanwezig' : file ? 'Upload' : url ? 'Externe URL' : '',
      };
    },
  },
});
