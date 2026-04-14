import { createServer } from 'node:http'
import { OpenAPIHandler } from '@orpc/openapi/node'
import { RPCHandler } from '@orpc/server/node'
import { CORSPlugin } from '@orpc/server/plugins'
import { router } from './router'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { OpenAPIGenerator } from '@orpc/openapi'
import { SmartCoercionPlugin } from '@orpc/json-schema'
import { env } from '@env'

const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [
        new ZodToJsonSchemaConverter(),
    ],
})

export class ORPCServer {
    static listen() {
        const commonOptions = {
            plugins: [
                new CORSPlugin({
                    origin: '*',
                }),
                new SmartCoercionPlugin({
                    schemaConverters: [
                        new ZodToJsonSchemaConverter(),
                    ],
                })
            ],
        }

        const openApiHandler = new OpenAPIHandler(router, commonOptions)
        const rpcHandler = new RPCHandler(router, commonOptions)

        const server = createServer(async (req, res) => {
            // Enable CORS manually for development
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            if (req.url === '/spec.json') {
                const spec = await openAPIGenerator.generate(router, {

                    info: {
                        title: 'My Playground',
                        version: '1.0.0',
                    },
                    servers: [
                        { url: '/rest' }, /** Should use absolute URLs in production */
                    ],
                    security: [{ bearerAuth: [] }],
                    components: {
                        securitySchemes: {
                            bearerAuth: {
                                type: 'http',
                                scheme: 'bearer',
                            },
                        },
                    },
                })

                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(spec))
                return
            }

            if (req.url === '/docs') {
                const html = `
    <!doctype html>
    <html>
      <head>
        <title>My Client</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.dev/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/spec.json',
            authentication: {
              securitySchemes: {
                bearerAuth: {
                  token: 'default-token',
                },
              },
            },
          })
        </script>
      </body>
    </html>
  `

                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.end(html)
                return
            }


            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
                if (value) {
                    headers.append(key, value as string);
                }
            }

            // Handle RPC format requests first on /api
            const rpcResult = await rpcHandler.handle(req, res, {
                context: { headers },
                prefix: "/api",
            })
            

            console.log(req.url, rpcResult)

            if (rpcResult.matched) return

            // Handle REST formatted requests on /rest
            const openApiResult = await openApiHandler.handle(req, res, {
                context: { headers },
                prefix: "/rest",
            })

            if (openApiResult.matched) return

            res.statusCode = 404
            res.end('No procedure matched')
        });

        server.listen(
            env.PORT,
            '0.0.0.0',
            () => console.log(`Listening on http://0.0.0.0:${env.PORT}/docs`)
        )
    }
}

