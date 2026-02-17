O estilo de Mike Mentzer, conhecido como **Heavy Duty** ou **HIT (High-Intensity Training)**, baseia-se na premissa de que a intensidade, e não o volume, é o gatilho para a hipertrofia. Para um praticante natural com 5 anos de treino, essa abordagem é extremamente eficiente para quebrar platôs de força, desde que a recuperação seja rigorosamente respeitada, já que o volume total de sets é drasticamente reduzido para poupar o sistema nervoso central.

### O Estilo Mentzer: Carga Alta e Repetições Baixas

Diferente das rotinas tradicionais de 10-20 séries por músculo, o Heavy Duty defende que, uma vez que uma fibra muscular é totalmente recrutada e levada à falha, qualquer série adicional é apenas "junk volume" que consome recursos de recuperação sem gerar estímulo extra.

* **Intensidade Absoluta:** Cada série de trabalho deve ser levada até a falha muscular concêntrica total (onde é impossível completar outra repetição com forma perfeita).
* **Baixo Volume:** Geralmente apenas **1 a 2 séries de trabalho** por exercício.
* **Repetições e Cadência:** O foco costuma ser na faixa de **6 a 10 repetições** para membros superiores e um pouco mais (**12 a 20**) para pernas, sempre com um tempo sob tensão (TUT) controlado, enfatizando a fase excêntrica (descida) em cerca de 4 segundos.
* **Frequência Reduzida:** Treinos curtos (15-30 min) e infrequentes, com descansos de **4 a 7 dias** entre o treinamento do mesmo grupamento muscular.

### Sugestões para o "Modo HIT" no seu Web App

Para o seu aplicativo, o "Modo de Treinos Curtos" (HIT Mode) deve focar em métricas de intensidade e gestão de recuperação. Abaixo, sugestões de funcionalidades lógicas:

#### 1. Rastreamento de "Top Set" Único

Em vez de uma lista longa de sets, o app deve destacar um único **Working Set**.

* **Lógica:** O app preenche automaticamente 1-2 sets de aquecimento (50% e 75% da carga alvo) que não contam para a fadiga, e deixa o campo principal para o "All-out Set".
* **Métrica de Sucesso:** Se o usuário atingir o topo da faixa de repetições (ex: 10 reps), o app sugere automaticamente um aumento de carga de 5% a 10% para o próximo treino.

#### 2. Botões de Técnicas de Intensidade

Como o volume é baixo, Mentzer usava técnicas para ir "além da falha". Adicione seletores (toggles) no log do set:

* **Forced Reps:** Marcar se um parceiro ajudou em 2-3 reps extras após a falha.
* **Rest-Pause:** Cronômetro interno de 15-20 segundos após a falha para realizar mais 1-2 reps com o mesmo peso.
* **Negativas:** Log de tempo para a fase excêntrica (ex: meta de 6 segundos na descida).

#### 3. Algoritmo de Recuperação e "Prontidão"

Mentzer acreditava que o progresso só ocorre se houver recuperação total.

* **Frequência Adaptativa:** Se o usuário não bater o recorde de carga/reps do treino anterior, o app deve sugerir automaticamente um dia extra de descanso antes da próxima sessão.
* **Intervalo de Beep de Cadência:** Um timer sonoro configurável (ex: bipe a cada 2 segundos) para ajudar o usuário a manter o tempo sob tensão sem precisar olhar para o relógio.

#### 4. Estrutura de Treino "MVP" (Ideal para o App)

Sugestão de uma rotina curta (3 dias/semana ou a cada 48-72h) baseada no Heavy Duty clássico para o seu perfil:

| Dia | Foco | Exercícios (1-2 Working Sets até a Falha) |
| --- | --- | --- |
| **A** | **Empurrar** | Supino Inclinado (Halteres), Desenvolvimento Militar, Paralelas (Dips). |
| **B** | **Puxar** | Pullover (Máquina/Halter), Pulldown Supinado, Levantamento Terra (ou Remada). |
| **C** | **Pernas** | Extensora (Pré-exaustão), Leg Press ou Agachamento, Flexora, Panturrilha. |

### Considerações para o Natural (Testosterona Mediana)

Embora Mentzer tenha treinado atletas que usavam substâncias, para o natural a lógica de **baixo volume** é excelente para gerir o cortisol. No entanto, o app deve ser conservador: não sugira técnicas de "além da falha" (negativas/forced reps) em todos os treinos, apenas no último set de cada exercício para evitar o overreaching sistêmico rápido demais.
