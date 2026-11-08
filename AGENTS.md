# Workflow del repository

- Al termine di ogni intervento, eseguire la build del sito e anche quella Docker con `docker build -t inballet-site .` (il Dockerfile esegue `npm run build`), aggiornare il container locale, creare il commit delle modifiche dell’intervento e fare push sul branch corrente, salvo istruzioni diverse dell’utente. La sola build npm non basta.
- Dopo una build Docker riuscita, ricreare `inballet-web` con `docker rm -f inballet-web` e `docker run -d --name inballet-web -p 3000:8080 --env-file .env -v inballet-data:/app/data inballet-site`, preservando il volume dati e le eventuali altre impostazioni del container esistente. Non rimuovere il volume. Verificare che `http://localhost:3000/corsi` risponda e contenga le modifiche prima di concludere.
- Preservare le modifiche locali preesistenti e includerle nel commit solo se fanno parte dell’intervento autorizzato.
- Le frecce dei sottocorsi non devono avere sottolineature decorative. Nei box della pagina `/contatti` centrare tutti i testi e le icone (recapiti, sedi e orari), anche su mobile: icona sopra e testo sotto sullo stesso asse centrale, senza colonne laterali per le icone né sottogriglie di recapiti affiancati.
- Struttura delle pagine, sistema di stile e regole di layout (compresa la pagina `/corsi`): vedi `CLAUDE.md`, che è la fonte unica.
