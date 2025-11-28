# Roadmap do Projeto: TFT-ASSISTANT

## Objetivo Principal
Criar um overlay amigável que utiliza visão computacional e (futuramente) IA para fornecer dicas e sugestões de composição em tempo real a qualquer jogador de TFT.

---

## 1. Fundações e Dados (Concluída/Ajustada)

* **Setup do Ambiente:** Repositório Git, Node.js e Python configurados (Concluído).
* **Acesso às APIs:** API Key da Riot e testes de comunicação com TFT/Champions API concluídos (Concluído).
* **Dados Estáticos:** Download e estruturação de todos os dados do Data Dragon (Sets atuais, Ícones, Itens, Augments, etc.).

---

## 2. Visão Computacional e Comunicação (O "Olho" do Sistema)

Este é o ponto crucial para o sucesso do projeto, pois lida com a leitura do estado do jogo.

* **Captura de Tela Otimizada:**
    * Implementar a captura de frames da janela do jogo (LoL Client) de forma rápida e com baixo impacto na performance.
    * **Tecnologia:** Python (`mss` ou biblioteca similar).
* **Reconhecimento de Elementos:**
    * Utilizar **OCR** (`EasyOCR`/`Tesseract`) para ler Ouro, HP e Nível.
    * Utilizar **Template Matching** ou **Modelos YOLO** (`OpenCV`) para identificar os campeões na loja e no tabuleiro.
* **Tratamento de Resolução:** Implementar lógica para normalizar a captura e o reconhecimento de imagem em diferentes resoluções.
* **Conexão em Tempo Real:**
    * Implementar o protocolo `Socket.io` para criar uma ponte de comunicação.
    * O script Python deve enviar os dados do jogo atualizados (formato JSON) para o servidor Node.js.

---

## 3. Frontend e Interface (A "Cara" do Sistema)

* **Estrutura do Overlay:**
    * Configurar o ambiente `Electron` para empacotar o `Express.js`.
    * Criar uma janela transparente, com a propriedade "always-on-top", sobre o cliente do jogo.
* **Design da UI/UX:**
    * Criar o layout da interface (HUD), garantindo que seja **minimalista, informativo** e "click-through" (os cliques do mouse passam pela interface para o jogo).
* **Visualização de Dados:**
    * O frontend deve consumir os dados do `Socket.io` e atualizar a interface de forma assíncrona (ex: usar um framework leve como Vue/React ou Vanilla JS otimizado).

---

## 4. Inteligência e Recomendações (O "Cérebro" do Sistema)

Esta fase é responsável por transformar os dados visuais em conselhos úteis.

* **Motor de Regras (MVP):** Implementar lógica baseada em regras estáticas (Meta atual) para:
    * Sugestão de **Composições** (Comps) ideais.
    * Sugestão de **Itens** para campeões chave.
* **Integração de Meta-Dados:** Desenvolver um *scraper* ou API *client* para integrar e manter atualizadas as *Tier Lists* de fontes externas.
* **Desenvolvimento da IA (FUTURO):**
    * Treinar um modelo para calcular o *Valor* e o *Win Rate* de diferentes alterações de equipa, usando o histórico de partidas (Match History API).
* **Exibição de Dicas:** Otimizar a apresentação das sugestões da IA no Overlay (curtas e no momento certo).

---

## 5. Testes, Otimização e Lançamento

* **Testes de Estabilidade:** Garantir que a aplicação se mantém estável durante longos períodos de jogo e transições de tela.
* **Otimização de Performance:** Reduzir o consumo de CPU/RAM, priorizando a experiência de jogo do utilizador.
* **Teste de Conformidade Riot:** Revisar o projeto para garantir o cumprimento das regras da Riot Games (foco estrito na informação, sem automação de jogadas).
* **Distribuição:** Criar um instalador ou pacote executável simples (`.exe`) para o utilizador final.
