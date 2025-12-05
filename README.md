# Projeto: TFT Assistant

Este projeto visa criar uma ferramenta de assistência em tempo real para o jogo Teamfight Tactics (TFT) da Riot Games. O objetivo principal é melhorar a experiência de jogo e a tomada de decisões de qualquer jogador, através de um display amigável e informativo.

## Visão Geral e Objetivo

A ferramenta irá analisar o estado atual do jogo do jogador (campeões no tabuleiro, itens, ouro, loja) e fornecer sugestões estratégicas. O jogador pode escolher uma equipa e, através da lógica de IA (a ser implementada), o sistema indicará alterações que trariam mais valor à equipa.

O objetivo final é permitir que qualquer jogador consiga obter bons resultados no jogo através de um *display* claro e conciso.

## Tecnologias Chave

O projeto utiliza uma arquitetura híbrida para combinar a leitura visual com uma interface de utilizador leve:

* **Backend & IA/Visão:** **Python**. Utilizado para reconhecimento de imagem, leitura de OCR (leitura de texto na tela) e processamento da lógica de sugestão e IA.
* **Overlay & Frontend:** **Express.js** empacotado com **Electron**. Esta combinação é usada para criar o *overlay* transparente que se sobrepõe ao jogo, garantindo que o display seja sempre visível e interativo.
* **Comunicação:** **Socket.io** é o protocolo de eleição para garantir a troca de dados em tempo real e de baixa latência entre o Python e o Express.js.
* **Fontes de Dados:** O sistema depende da integração com as APIs da Riot Games (Data Dragon, Documentação TFT, e API do Cliente de Jogo).

## Conformidade e Segurança

É crucial que o assistente seja estritamente **informativo**. O projeto opera dentro das diretrizes da Riot Games e do seu sistema anti-fraude (Vanguard), não realizando ações automatizadas ou manipulando o cliente do jogo.

## Plano de Implementação

Para consultar o detalhe das fases de desenvolvimento, desde a visão computacional até à implementação da IA e testes, consulte o ficheiro de planeamento:

[PLANO DE TRABALHO DETALHADO](./ROADMAP.md)