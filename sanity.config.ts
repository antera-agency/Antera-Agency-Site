'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schema } from './sanity/schemaTypes';
import { structure } from './sanity/structure';
import { apiVersion, dataset, projectId } from './sanity/env';

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  document: {
  comments: {
    enabled: false,
  },
},
  schema,
  plugins: [
    structureTool({ structure }),
    // Vision-tool: handig om GROQ-queries direct in de Studio te
    // testen (Studio → "Vision" tab). Puur een ontwikkelaars-tool,
    // heeft geen effect op de live site.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
