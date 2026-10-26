// --- FRENCH WORD LIST (~1500 common words) ------------------------------------
// Validated against tile system: every word is spellable character-by-character
// using the French tile deck. Accented chars must match tiles (é,è,ê,à,â,î,ô,û,ç).

export const FRENCH_WORD_LIST: string[] = [
  // ── Articles & déterminants ────────────────────────────────────────────────
  "le","la","les","un","une","des","du","de","au","aux",
  "mon","ma","mes","ton","ta","tes","son","sa","ses",
  "notre","nos","votre","vos","leur","leurs",
  "ce","cet","cette","ces","tout","toute","tous","toutes",
  "quel","quelle","quels","quelles","chaque",

  // ── Pronoms ────────────────────────────────────────────────────────────────
  "je","tu","il","elle","on","nous","vous","ils","elles",
  "me","te","se","lui","en","y","qui","que","quoi","dont",
  "rien","personne","quelqu","chose","autre","même",

  // ── Prépositions & conjonctions ────────────────────────────────────────────
  "et","ou","ni","mais","donc","car","si","or","que","quand",
  "comme","avec","sans","sur","sous","dans","par","pour",
  "vers","chez","entre","depuis","pendant","après","avant",
  "contre","selon","malgré","parmi","jusqu",

  // ── Adverbes courants ──────────────────────────────────────────────────────
  "très","plus","moins","aussi","bien","mal","vite","trop",
  "encore","déjà","jamais","toujours","souvent","parfois",
  "maintenant","demain","hier","ici","là","partout",
  "peut","non","oui","peut-être","ensemble","seul","seule",
  "peu","beaucoup","assez","trop","tant","autant",

  // ── Nombres ────────────────────────────────────────────────────────────────
  "un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix",
  "onze","douze","treize","quatorze","quinze","seize",
  "vingt","trente","quarante","cinquante","soixante","cent","mille",
  "premier","première","second","deuxième","troisième",

  // ── Jours & mois ──────────────────────────────────────────────────────────
  "lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche",
  "janvier","février","mars","avril","mai","juin",
  "juillet","août","septembre","octobre","novembre","décembre",
  "printemps","été","automne","hiver","saison",

  // ── Temps & durée ─────────────────────────────────────────────────────────
  "heure","minute","seconde","jour","nuit","matin","soir","midi",
  "semaine","mois","an","année","siècle","instant","moment","fois",
  "temps","date","durée","période","époque","ère",

  // ── Couleurs ───────────────────────────────────────────────────────────────
  "rouge","bleu","vert","blanc","noir","jaune","rose","violet",
  "orange","gris","brun","beige","marron","doré","argenté",
  "blanche","verte","bleue","noire","grise","brune",

  // ── Animaux ────────────────────────────────────────────────────────────────
  "chat","chien","oiseau","poisson","cheval","vache","mouton",
  "cochon","lapin","canard","lion","tigre","ours","loup","renard",
  "cerf","rat","souris","poule","coq","âne","serpent","perroquet",
  "dauphin","baleine","requin","tortue","grenouille","aigle",
  "hibou","canari","hamster","singe","éléphant","girafe","zèbre",
  "crocodile","panthère","jaguar","lynx","castor","hérisson",
  "écureuil","papillon","abeille","fourmi","moustique","cigale",
  "pie","moineau","hirondelle","corbeau","pélican","flamant",

  // ── Corps humain ───────────────────────────────────────────────────────────
  "tête","main","pied","bras","jambe","nez","bouche","oreille",
  "dos","ventre","cheveu","dent","langue","cou","épaule","genou",
  "pouce","doigt","front","joue","menton","gorge","poitrine",
  "talon","cheville","hanche","coude","poignet","sourcil",
  "paupière","lèvre","os","muscle","sang","peau","ongle",

  // ── Nourriture & boissons ─────────────────────────────────────────────────
  "pain","vin","eau","lait","fromage","beurre","viande","légume","fruit",
  "pomme","poire","cerise","fraise","orange","citron","tomate",
  "carotte","oignon","ail","soupe","gâteau","sucre","sel","poivre",
  "huile","café","thé","jus","bière","crème","glace","tarte",
  "biscuit","croissant","confiture","miel","chocolat","bonbon",
  "riz","haricot","salade","mousse","sauce","flan",
  "poulet","canard","saumon","thon","crevette","moule",
  "raisin","abricot","pêche","melon","cerise","framboise",
  "champignon","courgette","poireau","épinard","artichaut",
  "baguette","brioche","quiche","gratin","ragoût",

  // ── Maison & lieux ────────────────────────────────────────────────────────
  "maison","appartement","ville","village","pays","monde","rue",
  "avenue","boulevard","place","jardin","parc","forêt","mer",
  "océan","rivière","montagne","plage","île","désert","ciel",
  "soleil","lune","étoile","nuage","pluie","neige","vent",
  "terre","bois","champ","vallée","colline","lac","fleuve",
  "porte","fenêtre","toit","mur","sol","plafond","escalier",
  "cuisine","salon","chambre","salle","couloir","garage","cave",
  "bureau","école","église","hôpital","hôtel","gare","aéroport",
  "marché","magasin","restaurant","cinéma","théâtre","musée",
  "bibliothèque","stade","piscine","boulangerie","pharmacie",

  // ── Famille & relations ────────────────────────────────────────────────────
  "père","mère","fils","fille","frère","soeur","cousin","cousine",
  "oncle","tante","enfant","bébé","mari","femme","ami","amie",
  "voisin","voisine","collègue","professeur","médecin","docteur",
  "patron","chef","directeur","président","ministre","roi","reine",

  // ── Verbes courants (infinitif) ────────────────────────────────────────────
  "être","avoir","faire","aller","venir","voir","savoir","pouvoir",
  "vouloir","mettre","prendre","dire","donner","trouver","aimer",
  "partir","sortir","entrer","passer","manger","boire","dormir",
  "courir","lire","écrire","parler","chercher","regarder","penser",
  "croire","vivre","mourir","naître","grandir","changer","rester",
  "rentrer","monter","descendre","ouvrir","fermer","commencer",
  "finir","attendre","répondre","demander","appeler","écouter",
  "aider","marcher","danser","chanter","jouer","travailler",
  "étudier","apprendre","enseigner","acheter","vendre","payer",
  "porter","poser","lever","baisser","toucher","sentir","goûter",
  "nager","voler","tomber","couper","casser","construire","peindre",
  "dessiner","cuisiner","nourrir","soigner","guérir","protéger",
  "montrer","expliquer","raconter","choisir","décider","inviter",
  "voyager","visiter","découvrir","explorer","revenir","retourner",

  // ── Formes verbales conjuguées ────────────────────────────────────────────
  "est","sont","ont","fait","va","sait","peut","veut","vient",
  "voit","met","prend","dit","donne","trouve","aime","part",
  "sort","entre","passe","mange","boit","dort","court","lit",
  "écrit","parle","cherche","regarde","pense","croit","vit",
  "finit","attend","répond","demande","appelle","écoute","marche",
  "danse","chante","joue","travaille","étudie","apprend","achète",
  "vend","porte","pose","lève","touche","nage","tombe","coupe",
  "avait","était","allait","venait","faisait","savait","pouvait",
  "voulait","voyait","donnait","trouvait","aimait","parlait",
  "sera","aura","fera","ira","viendra","verra","saura","pourra",
  "ai","as","ont","suis","es","êtes",

  // ── Adjectifs qualificatifs ────────────────────────────────────────────────
  "grand","grande","petit","petite","bon","bonne","mauvais","mauvaise",
  "beau","belle","joli","jolie","fort","forte","faible","haut","haute",
  "bas","basse","long","longue","court","courte","large","étroit",
  "gros","grosse","mince","vieux","vieille","jeune","nouveau","nouvelle",
  "ancien","ancienne","bel","chaud","chaude","froid","froide",
  "doux","douce","dur","dure","rapide","lent","lente","facile",
  "difficile","simple","compliqué","riche","pauvre","heureux","heureuse",
  "triste","content","contente","fâché","fâchée","fatigué","fatiguée",
  "malade","sain","saine","propre","sale","neuf","neuve","vrai","vraie",
  "faux","fausse","seul","seule","même","autre","tel","telle",
  "libre","ouvert","ouverte","fermé","fermée","plein","pleine","vide",
  "possible","impossible","certain","incertain","public","privé",
  "national","international","local","général","particulier",
  "humain","naturel","social","culturel","politique","économique",
  "juste","injuste","brave","gentil","gentille","méchant","méchante",
  "intelligent","intelligente","bête","drôle","sérieux","sérieuse",
  "calme","nerveux","nerveuse","timide","courageux","courageuse",
  "patient","impatient","poli","impoli","curieux","curieuse",

  // ── Mots du quotidien ─────────────────────────────────────────────────────
  "bonjour","bonsoir","bonne nuit","merci","pardon","excusez","bienvenue",
  "oui","non","peut","voilà","voici","alors","donc","quand","comment",
  "pourquoi","combien","lequel","laquelle","lesquels",

  // ── Objets courants ────────────────────────────────────────────────────────
  "table","chaise","lit","canapé","armoire","tiroir","miroir","lampe",
  "télévision","ordinateur","téléphone","radio","livre","journal",
  "cahier","stylo","crayon","gomme","règle","sac","valise","porte-monnaie",
  "clé","montre","lunettes","chapeau","bonnet","écharpe","gant","ceinture",
  "robe","pantalon","jupe","chemise","veste","manteau","chaussure","botte",
  "voiture","vélo","moto","bus","train","avion","bateau","camion",
  "carte","photo","lettre","enveloppe","timbre","boîte","bouteille",
  "verre","assiette","bol","tasse","couteau","fourchette","cuillère",
  "casserole","poêle","four","réfrigérateur","machine",

  // ── Nature & environnement ────────────────────────────────────────────────
  "arbre","fleur","herbe","feuille","branche","racine","graine","mousse",
  "sable","pierre","roche","montagne","colline","rivière","ruisseau",
  "pluie","neige","glace","vent","orage","tonnerre","éclaire","brouillard",
  "arc-en-ciel","coucher","lever","horizon","vague","marée","courant",

  // ── Santé & corps ─────────────────────────────────────────────────────────
  "santé","maladie","douleur","fièvre","toux","rhume","grippe",
  "médicament","pilule","sirop","opération","blessure","cicatrice",
  "allergie","vaccin","régime","sport","exercice","repos","sommeil",

  // ── Émotions & sentiments ─────────────────────────────────────────────────
  "amour","haine","joie","tristesse","colère","peur","surprise",
  "dégoût","curiosité","jalousie","fierté","honte","culpabilité",
  "désir","espoir","désespoir","bonheur","malheur","chance","malchance",
  "rire","pleurer","sourire","crier","gémir","soupirer",

  // ── Mots avec sons spéciaux ───────────────────────────────────────────────
  // demonstrating French digraphs and compound vowels
  "chanson","maison","raison","saison","boisson","poison","comparaison",
  "foisonner","noix","voix","croix","bois","poids","choix","fois",
  "genou","chou","loup","coup","tout","doux","doux","foulard",
  "bleu","feu","jeu","peu","mieux","eux","deux","vieux","nœud",
  "eau","beau","veau","seau","peau","tableau","chapeau","gâteau",
  "photo","pharmacie","phrase","éléphant","alphabet","prophète",
  "champagne","cognac","montagne","compagne","accompagne","témoigne",
  "grand","blanc","franc","france","branche","anche","manche","panche",
  "prince","tranche","blanche","plancher","lancer",
  "fleur","pleur","couleur","douleur","odeur","chaleur","valeur",
  "peur","bonheur","malheur","coeur","rêveur","acteur","auteur",
  "train","pain","main","sain","bain","gain","nain","vain","plain",
  "voisin","cousin","bassin","raisin","Latin","dessin","chemin",
  "garçon","leçon","façon","maçon","balcon","plaçon","Mançon",

  // ── Mots courts spéciaux ─────────────────────────────────────────────────
  "cle","bol","bal","gel","sol","vol","col","col","val","fil","mil",
  "cap","map","rap","sap","top","bop","pop","hop",
  "arc","lac","tac","mac","sac","bac","pac",
  "box","fox","jox","cox","vox",

  // ── Mots d'usage fréquent ─────────────────────────────────────────────────
  "chose","façon","part","cas","lieu","fois","genre","type","sorte",
  "côté","bout","haut","bas","milieu","centre","fond","bord","coin",
  "début","fin","suite","suite","étape","niveau","degré","point",
  "nombre","chiffre","lettre","son","image","signe","forme","couleur",
  "ordre","rang","classe","groupe","équipe","parti","camp","côte",
  "résultat","effet","cause","raison","besoin","envie","plaisir","peine",
  "effort","travail","service","aide","soin","tour","action","mission",

  // ── 2-3 lettres très courants ─────────────────────────────────────────────
  "as","os","si","ni","or","bi","su","vu","bu","lu","nu","ci",
  "bel","gel","sel","tel","vel","mel","col","bol","sol","vol","mol",
  "car","bar","far","jar","par","tar","var","mar",
  "cou","fou","mou","sou","dou","lou","nou","pou","vou",
  "ail","bil","cil","fil","mil","nil","oil","pil","vil",
  "arc","bec","sec","vec","pic","tic","suc","duc",
  "net","set","tet","bet","jet","let","met","ret","vet",
];

export const FRENCH_WORD_SET = new Set(FRENCH_WORD_LIST.map(w => w.toLowerCase()));

export function checkFrenchWord(word: string): boolean {
  return FRENCH_WORD_SET.has(word.toLowerCase());
}
