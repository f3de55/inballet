<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="it">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex, follow"/>
        <title>Mappa del sito XML · InBallet</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; background: #eef7fa; color: #444; font: 15px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
          header { padding: 40px 24px 96px; background: #1a1a1a; color: #fff; }
          .larghezza { max-width: 1040px; margin: 0 auto; }
          .etichetta { margin: 0 0 8px; color: #87ceeb; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }
          h1 { margin: 0 0 12px; font-size: 32px; line-height: 1.2; }
          header p { max-width: 640px; margin: 0; color: rgba(255, 255, 255, 0.78); }
          header a { color: #87ceeb; }
          main { padding: 0 24px 48px; }
          .scheda { margin-top: -64px; overflow: hidden; border-radius: 16px; background: #fff; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); }
          .riepilogo { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 20px 24px; border-bottom: 2px solid #eef7fa; }
          .conteggio { padding: 4px 12px; border-radius: 999px; background: #87ceeb; color: #1a1a1a; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; }
          th { padding: 12px 24px; color: #3b72a0; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-align: left; text-transform: uppercase; }
          td { padding: 12px 24px; border-top: 1px solid rgba(26, 26, 26, 0.08); }
          tr:nth-child(even) td { background: #f7fbfd; }
          td.numero { width: 64px; color: #666; font-variant-numeric: tabular-nums; }
          td a { color: #1a1a1a; text-decoration: none; word-break: break-all; }
          td a:hover { color: #3b72a0; text-decoration: underline; }
          footer { padding: 24px 0 0; color: #666; font-size: 13px; text-align: center; }
        </style>
      </head>
      <body>
        <header>
          <div class="larghezza">
            <p class="etichetta">InBallet · Scuola di danza a Lainate e Rho</p>
            <h1>Mappa del sito XML</h1>
            <p>Questa è la mappa che il sito consegna a Google e agli altri motori di ricerca: l’elenco di tutte le pagine da trovare e mostrare nei risultati. Per le persone c’è il <a href="/">sito</a>.</p>
          </div>
        </header>
        <main>
          <div class="larghezza">
            <div class="scheda">
              <xsl:choose>
                <xsl:when test="s:sitemapindex">
                  <div class="riepilogo">
                    <span class="conteggio"><xsl:value-of select="count(s:sitemapindex/s:sitemap)"/></span>
                    <span>mappe in questo indice</span>
                  </div>
                  <table>
                    <thead><tr><th>#</th><th>Mappa</th></tr></thead>
                    <tbody>
                      <xsl:for-each select="s:sitemapindex/s:sitemap">
                        <tr>
                          <td class="numero"><xsl:value-of select="position()"/></td>
                          <td><a class="indirizzo" href="{substring-after(s:loc, '.it')}"><xsl:value-of select="substring-after(s:loc, '.it')"/></a></td>
                        </tr>
                      </xsl:for-each>
                    </tbody>
                  </table>
                </xsl:when>
                <xsl:otherwise>
                  <div class="riepilogo">
                    <span class="conteggio"><xsl:value-of select="count(s:urlset/s:url)"/></span>
                    <span>pagine elencate per Google</span>
                  </div>
                  <table>
                    <thead><tr><th>#</th><th>Pagina</th></tr></thead>
                    <tbody>
                      <xsl:for-each select="s:urlset/s:url">
                        <tr>
                          <td class="numero"><xsl:value-of select="position()"/></td>
                          <td><a class="indirizzo" href="{substring-after(s:loc, '.it')}"><xsl:value-of select="substring-after(s:loc, '.it')"/></a></td>
                        </tr>
                      </xsl:for-each>
                    </tbody>
                  </table>
                </xsl:otherwise>
              </xsl:choose>
            </div>
            <footer>Generata in automatico a ogni pubblicazione del sito. Per Google le pagine sono registrate sul dominio ufficiale www.inballet.it.</footer>
          </div>
        </main>
        <script>
          document.querySelectorAll('a.indirizzo').forEach(function (a) { a.textContent = a.href; });
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
