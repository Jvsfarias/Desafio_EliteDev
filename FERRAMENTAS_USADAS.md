# Ferramentas usadas e processo de desenvolvimento

## IA

Usei o Cursor com Claude como assistente durante o projeto. Não vou fingir que não usei — seria fácil perceber e não faz sentido esconder.

O que eu fiz foi usar a IA como uma ferramenta, não como o desenvolvedor. Cada funcionalidade foi planejada e estruturada por mim antes de qualquer geração de código: o que precisava existir, como as peças se encaixariam, quais rotas, quais responsabilidades de cada serviço. Dá pra ver isso no histórico de commits — cada parte foi desenvolvida de forma isolada, com commits descritivos, sem aquele dump de "implementei tudo de uma vez".

## Ferramentas e onde cada uma entrou

| Ferramenta | Onde foi usada |
|---|---|
| **Docker + Docker Compose** | Orquestração do backend e MongoDB em containers locais e na VPS |
| **MongoDB + Mongoose** | Banco de dados principal: usuários, eventos, ingressos, logs |
| **Node.js + Express** | API REST do backend, middlewares de autenticação e controle de papel |
| **React + Vite** | Frontend SPA com roteamento via React Router |
| **JWT + bcryptjs** | Autenticação stateless e hash de senhas |
| **Axios** | Chamadas HTTP do frontend para a API e da API para os serviços externos |
| **TMDB API** | Catálogo de filmes em cartaz na página de Cinema |
| **Ticketmaster API** | Catálogo de shows e eventos ao vivo na página de Eventos |
| **html5-qrcode** | Leitura de QR Code pela câmera na tela de Portaria |
| **qrcode** | Geração do QR Code do ingresso na tela do cliente |

## O que fiz sem IA

**Planejamento da arquitetura** — antes de escrever qualquer linha de código, estruturei o que o sistema precisava ter: quais entidades existiriam, como os papéis se relacionavam, o fluxo de compra, cancelamento e validação. A IA não tomou nenhuma dessas decisões.

**Organização dos commits** — cada funcionalidade foi desenvolvida e commitada de forma isolada, com mensagem descritiva. O histórico mostra o projeto crescendo em partes, não um único dump de código.

**Configuração do Docker e deploy na VPS** — subi o backend e o MongoDB na VPS que já uso pra meu e-commerce, configurei o proxy reverso e o domínio (`eventos.usevicjo.com.br`) por conta própria.

**Integração com as APIs externas** — busquei as documentações do TMDB e do Ticketmaster, entendi os endpoints disponíveis e decidi o que fazia sentido usar em cada parte do projeto.

## O que foi pedido vs. o que entreguei

Além dos requisitos básicos do desafio, adicionei algumas coisas por conta própria:

**Área de logs de atividade** — o organizador tem acesso a um histórico de todas as ações relevantes (compras, cancelamentos, validações de ingresso), com filtro por tipo e paginação. Nada disso foi pedido.

**Remoção automática de eventos expirados** — quando a data/horário de um evento passa, ele é removido automaticamente do sistema. Sessões passadas de filmes em cartaz também são limpas.

**Cancelamento pelo cliente e pelo organizador** — o cliente pode cancelar um ingresso e receber reembolso. O organizador pode cancelar um evento inteiro, o que cancela todos os ingressos ativos e reembolsa automaticamente todos os clientes. Ambos geram log.

**Busca com autocomplete no navbar** — campo de busca com debounce, dropdown de sugestões em tempo real e página de resultados dedicada.

**Pagamento simulado com aleatoriedade** — em vez de aprovar tudo automaticamente, usei `Math.random()` pra simular aprovação e recusa, tornando o fluxo mais realista.

**Controle de acesso por papel** — organizador não consegue comprar ingresso, portaria só acessa a tela de validação. Nada é escondido só no frontend: o backend valida o papel em cada rota protegida.

**Flag de seed** — o seed roda só na primeira vez. Uma flag é gravada no banco pra evitar duplicatas em reinicializações.

**Edição inline nos cards** — em vez de uma área "meus eventos" separada, o organizador edita diretamente pelo ícone em cima de cada card, o que é mais natural e evita uma tela desnecessária.
