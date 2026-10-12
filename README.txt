ETIQMAIS — Sistema de preços e impressão

Como usar (executável, recomendado)
1. Abra a pasta dist/ e execute ETIQMAIS.exe (não precisa instalar nada).
2. Cadastre os produtos em "Produtos".
3. Use "Imprimir etiquetas" ou "Tabela de preços".
4. Em "Configurações", escolha o tema (Claro, Noite ou Sistema).
5. Na janela de impressão, escolha qualquer impressora instalada.

Como usar (navegador, alternativa)
1. Extraia esta pasta em um local do computador.
2. Abra o arquivo index.html no navegador.
3. Em telas largas (desktop), o menu aparece como barra superior.

Dados e backup
- Os produtos são gravados localmente (navegador ou, no executável, no perfil do WebView2).
- Use "Exportar backup" antes de trocar de computador.
- Use "Importar backup" para restaurar os produtos.

Requisitos
- Windows 10/11 com o WebView2 Runtime (já vem instalado de fábrica na maioria dos PCs atualizados;
  se faltar, o Windows baixa automaticamente ao abrir o ETIQMAIS.exe pela primeira vez).
- Não é necessária conexão com a internet: Bootstrap e os ícones já vêm embutidos.

Gerar o executável novamente (para desenvolvedores)
1. pip install pywebview pyinstaller
2. Dentro da pasta etiqmais: pyinstaller --noconfirm --onefile --windowed --name ETIQMAIS
   --add-data "index.html;." --add-data "app.css;." --add-data "app.js;." --add-data "vendor;vendor" main.py
3. O executável fica em dist/ETIQMAIS.exe
