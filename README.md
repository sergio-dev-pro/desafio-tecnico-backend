# desafio-tecnico-backend
Criar uma API REST para facilitar o gerenciamento de horários de uma clínica! Sua API deve conter endpoints para satisfazer as seguintes features: - Cadastrar regras de horários para atendimento - Apagar regra de horário para atendimento - Listar regras de horários para atendimento - Listar horários disponíveis dentro de um intervalo

# Informações gerais

- Os dados de criação de regras estão sendo salvas no arquivo "rules-data.json" que se encontra na raís do projeto.
- Os exemplos de endpoints para api estão no arquivo "EndPointe-exemplos.postman_collection.json" que se encontra na raís do projeto.
- Existe validação de horários para que não aja conflito entre horarios de regras já criadas.
- Para deletar uma regra especifica, já que pode existir várias para datas e dias diferentes, liste as regras para pegar o identificador do dia especifico.
- Para deletar, se for regra semanal ou diária o identificador é padrão como está na solicitação no postman salvo.

# Plus 

- TypeScript
- Documentação
