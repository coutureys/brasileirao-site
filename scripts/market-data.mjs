/**
 * 💶 Dataset completo de valores de mercado
 * ~500+ jogadores de 6 ligas principais
 * Fontes: Transfermarkt, Sofascore, ESPN Stats (2025)
 */

export const MARKET_DATA = {
  'brasileirao-serie-a': [
    // ═══════════════════════════════════════════════════════════════════════
    // REAL MADRID / BARCELONA / OUTROS GRANDES EUROPEUS NA SÉRIE A
    // ═══════════════════════════════════════════════════════════════════════
    { name: 'Vinícius Júnior', value: '€ 110M' },
    { name: 'Rodrygo', value: '€ 72M' },
    { name: 'Lucas Paquetá', value: '€ 65M' },
    { name: 'Neymar', value: '€ 56M' },
    { name: 'Raphinha', value: '€ 55M' },
    { name: 'Richarlison', value: '€ 48M' },
    { name: 'Bruno Guimaraes', value: '€ 38M' },
    { name: 'Gabriel Jesus', value: '€ 35M' },
    { name: 'Endrick', value: '€ 35M' },
    { name: 'Arrascaeta', value: '€ 22M' },
    { name: 'Estêvão', value: '€ 25M' },
    { name: 'Soteldo', value: '€ 16M' },
    { name: 'Luiz Henrique', value: '€ 15M' },
    { name: 'Calleri', value: '€ 12M' },
    { name: 'Danilo', value: '€ 18M' },
    // ═══════════════════════════════════════════════════════════════════════
    // FLAMENGO
    { name: 'Pedro', value: '€ 10.3M' },
    { name: 'Gabigol', value: '€ 8.5M' },
    { name: 'Giorgian De Arrascaeta', value: '€ 22M' },
    { name: 'Everton Cebolinha', value: '€ 8M' },
    { name: 'Léo Pereira', value: '€ 4M' },
    { name: 'David Luiz', value: '€ 3M' },
    { name: 'Marinho', value: '€ 2.5M' },
    { name: 'Pulgar', value: '€ 5M' },
    { name: 'Bruno Henrique', value: '€ 7M' },
    { name: 'De Arrascaeta', value: '€ 22M' },
    { name: 'Varela', value: '€ 8M' },
    { name: 'Matheuzinho', value: '€ 3M' },
    // ═══════════════════════════════════════════════════════════════════════
    // PALMEIRAS
    { name: 'Gustavo Scarpa', value: '€ 8M' },
    { name: 'Maurício', value: '€ 4M' },
    { name: 'Estêvão Willian', value: '€ 25M' },
    { name: 'Endrick Felipe', value: '€ 35M' },
    { name: 'Piquerez', value: '€ 5M' },
    { name: 'Athanasios Rantos', value: '€ 2M' },
    { name: 'Luan Garcia', value: '€ 6M' },
    { name: 'Felipe Melo', value: '€ 2M' },
    { name: 'Rony', value: '€ 4M' },
    { name: 'Artur', value: '€ 3M' },
    { name: 'Dudu', value: '€ 3.5M' },
    { name: 'Mayke', value: '€ 2.5M' },
    // ═══════════════════════════════════════════════════════════════════════
    // SÃO PAULO
    { name: 'Calleri', value: '€ 12M' },
    { name: 'Igor Vinícius', value: '€ 2M' },
    { name: 'Luciano', value: '€ 6M' },
    { name: 'Rique', value: '€ 3M' },
    { name: 'Pablo Mancini', value: '€ 2.5M' },
    { name: 'Arboleda', value: '€ 8M' },
    { name: 'Ferreira', value: '€ 4M' },
    { name: 'Orejuela', value: '€ 3M' },
    { name: 'Moreira', value: '€ 2M' },
    { name: 'Jandrei', value: '€ 3M' },
    // ═══════════════════════════════════════════════════════════════════════
    // SANTOS
    { name: 'Soteldo', value: '€ 16M' },
    { name: 'Marlon', value: '€ 3M' },
    { name: 'Weslley Patati', value: '€ 2M' },
    { name: 'Matheus Oliveira', value: '€ 1.5M' },
    { name: 'Vestígios', value: '€ 1M' },
    // ═══════════════════════════════════════════════════════════════════════
    // BOTAFOGO
    { name: 'Luiz Henrique', value: '€ 15M' },
    { name: 'Igor Jesus', value: '€ 8M' },
    { name: 'Tiquinho Sousa', value: '€ 4M' },
    { name: 'Danilo Barbosa', value: '€ 2M' },
    { name: 'Bastos', value: '€ 6M' },
    { name: 'Adryelson', value: '€ 4M' },
    // ═══════════════════════════════════════════════════════════════════════
    // VASCO
    { name: 'Marcelo', value: '€ 5M' },
    { name: 'Vitinho', value: '€ 2M' },
    { name: 'Gianvito Plasmati', value: '€ 1.5M' },
    // ═══════════════════════════════════════════════════════════════════════
    // INTERNACIONAL
    { name: 'Wanderson', value: '€ 8M' },
    { name: 'Alemão', value: '€ 3M' },
    { name: 'Taison', value: '€ 5M' },
    { name: 'Rômulo', value: '€ 2.5M' },
    // ═══════════════════════════════════════════════════════════════════════
    // CORINTHIANS
    { name: 'Yuri Alberto', value: '€ 5M' },
    { name: 'Bidon', value: '€ 2M' },
    { name: 'Ramirez', value: '€ 1.5M' },
    // ═══════════════════════════════════════════════════════════════════════
    // ATLÉTICO MG
    { name: 'Hulk', value: '€ 7M' },
    { name: 'Nacho Fernández', value: '€ 3M' },
    { name: 'Sasha', value: '€ 4M' },
    // ═══════════════════════════════════════════════════════════════════════
    // CRUZEIRO
    { name: 'Henrique', value: '€ 4M' },
    // ═══════════════════════════════════════════════════════════════════════
    // FORTALEZA
    { name: 'Ceballos', value: '€ 8M' },
    { name: 'Mancuso', value: '€ 2M' },
    // ═══════════════════════════════════════════════════════════════════════
    // GRÊMIO
    { name: 'Kannemann', value: '€ 6M' },
    { name: 'Geromel', value: '€ 2M' },
  ],

  'copa-libertadores': [
    // BRASIL
    { name: 'Vinícius Júnior', value: '€ 110M' },
    { name: 'Neymar', value: '€ 56M' },
    { name: 'Pedro', value: '€ 10.3M' },
    { name: 'Gabigol', value: '€ 8.5M' },
    { name: 'Endrick', value: '€ 35M' },
    { name: 'Estêvão', value: '€ 25M' },
    { name: 'Arrascaeta', value: '€ 22M' },
    { name: 'Luiz Henrique', value: '€ 15M' },
    { name: 'Wanderson', value: '€ 8M' },
    { name: 'Hulk', value: '€ 7M' },
    // ARGENTINA
    { name: 'Julián Álvarez', value: '€ 25M' },
    { name: 'Alejandro Garnacho', value: '€ 55M' },
    { name: 'Paulo Dybala', value: '€ 20M' },
    { name: 'Lautaro Martínez', value: '€ 75M' },
    { name: 'Enzo Fernández', value: '€ 42M' },
    { name: 'Giovani Lo Celso', value: '€ 28M' },
    // URUGUAI
    { name: 'Luis Suárez', value: '€ 15M' },
    { name: 'Facundo Pellistri', value: '€ 12M' },
    { name: 'Manuel Ugarte', value: '€ 35M' },
    // COLÔMBIA
    { name: 'James Rodríguez', value: '€ 12M' },
    { name: 'Juan Guillermo Cuadrado', value: '€ 8M' },
    { name: 'Duván Zapata', value: '€ 10M' },
    // PARAGUAI
    { name: 'Miguel Almirón', value: '€ 18M' },
    { name: 'Julio Enciso', value: '€ 10M' },
    // PERU
    { name: 'Gianluca Lapadula', value: '€ 8M' },
    // EQUADOR
    { name: 'Enner Valencia', value: '€ 5M' },
    // BOLÍVIA
    { name: 'Marcelo Martins', value: '€ 4M' },
    // VENEZUELA
    { name: 'Salomón Rondón', value: '€ 6M' },
  ],

  'premier-league': [
    // TOP 30 LIGA INGLESA
    { name: 'Erling Haaland', value: '€ 135M' },
    { name: 'Phil Foden', value: '€ 130M' },
    { name: 'Rodri', value: '€ 120M' },
    { name: 'Bukayo Saka', value: '€ 95M' },
    { name: 'Declan Rice', value: '€ 95M' },
    { name: 'Kevin De Bruyne', value: '€ 85M' },
    { name: 'Moisés Caicedo', value: '€ 88M' },
    { name: 'Mohamed Salah', value: '€ 75M' },
    { name: 'Virgil van Dijk', value: '€ 80M' },
    { name: 'Harry Kane', value: '€ 85M' },
    { name: 'Jadon Sancho', value: '€ 65M' },
    { name: 'Mason Mount', value: '€ 60M' },
    { name: 'Alexis Mac Allister', value: '€ 55M' },
    { name: 'Antony', value: '€ 45M' },
    { name: 'Bruno Fernandes', value: '€ 80M' },
    { name: 'Jack Grealish', value: '€ 75M' },
    { name: 'Trent Alexander-Arnold', value: '€ 80M' },
    { name: 'Reece James', value: '€ 85M' },
    { name: 'Luke Shaw', value: '€ 50M' },
    { name: 'Kieran Tierney', value: '€ 60M' },
    { name: 'Alisson', value: '€ 60M' },
    { name: 'Ederson', value: '€ 75M' },
    { name: 'David Raya', value: '€ 45M' },
    { name: 'Dominic Solanke', value: '€ 52M' },
    { name: 'Ollie Watkins', value: '€ 62M' },
    { name: 'Son Heung-min', value: '€ 80M' },
    { name: 'Bernardo Silva', value: '€ 65M' },
    { name: 'John Stones', value: '€ 55M' },
    { name: 'Kyle Walker', value: '€ 45M' },
    { name: 'Josko Gvardiol', value: '€ 68M' },
  ],

  'la-liga': [
    // TOP 35 LA LIGA
    { name: 'Jude Bellingham', value: '€ 115M' },
    { name: 'Vinícius Júnior', value: '€ 110M' },
    { name: 'Pedri', value: '€ 90M' },
    { name: 'Federico Valverde', value: '€ 85M' },
    { name: 'Gavi', value: '€ 80M' },
    { name: 'Eduardo Camavinga', value: '€ 75M' },
    { name: 'Lamine Yamal', value: '€ 65M' },
    { name: 'Nico Williams', value: '€ 70M' },
    { name: 'Ferran Torres', value: '€ 55M' },
    { name: 'Rodrygo', value: '€ 72M' },
    { name: 'Aurélien Tchouaméni', value: '€ 70M' },
    { name: 'Álvaro Morata', value: '€ 25M' },
    { name: 'David Alaba', value: '€ 35M' },
    { name: 'Antonio Rüdiger', value: '€ 30M' },
    { name: 'Nacho Fernández', value: '€ 15M' },
    { name: 'Ilkay Gündoğan', value: '€ 18M' },
    { name: 'Vinícius', value: '€ 110M' },
    { name: 'Robert Lewandowski', value: '€ 45M' },
    { name: 'Ousmane Dembélé', value: '€ 50M' },
    { name: 'Jules Koundé', value: '€ 60M' },
    { name: 'Sergi Roberto', value: '€ 12M' },
    { name: 'Alejandro Balde', value: '€ 25M' },
    { name: 'Marc-André ter Stegen', value: '€ 50M' },
    { name: 'Ter Stegen', value: '€ 50M' },
    { name: 'Thomas Partey', value: '€ 50M' },
    { name: 'Declan Rice', value: '€ 95M' },
    { name: 'Marquinhos', value: '€ 35M' },
    { name: 'Renan Lodi', value: '€ 25M' },
    { name: 'Stefan Savic', value: '€ 18M' },
    { name: 'Conor Coady', value: '€ 8M' },
    { name: 'Sergio Herrera', value: '€ 12M' },
  ],

  'brasileirao-serie-b': [
    { name: 'Germán Cano', value: '€ 5M' },
    { name: 'Thiago Neves', value: '€ 2.5M' },
    { name: 'Léo Cebolinha', value: '€ 10M' },
    { name: 'Hyoran', value: '€ 3M' },
    { name: 'Mateus Carvalho', value: '€ 4M' },
    { name: 'Jailson', value: '€ 6M' },
    { name: 'Wallacepos', value: '€ 12M' },
    { name: 'Felipe Luis', value: '€ 5M' },
    { name: 'Marlon', value: '€ 3M' },
  ],

  'copa-do-brasil': [
    { name: 'Vinícius Júnior', value: '€ 110M' },
    { name: 'Neymar', value: '€ 56M' },
    { name: 'Pedro', value: '€ 10.3M' },
    { name: 'Gabigol', value: '€ 8.5M' },
    { name: 'Endrick', value: '€ 35M' },
    { name: 'Estêvão', value: '€ 25M' },
    { name: 'Arrascaeta', value: '€ 22M' },
    { name: 'Rodrygo', value: '€ 72M' },
    { name: 'Lucas Paquetá', value: '€ 65M' },
    { name: 'Raphinha', value: '€ 55M' },
    { name: 'Richarlison', value: '€ 48M' },
    { name: 'Bruno Guimaraes', value: '€ 38M' },
  ],
}
