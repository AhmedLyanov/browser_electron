// Импортируем нужные модули из Electron
const { contextBridge, ipcRenderer } = require("electron");
// Используем contextBridge для безопасного взаимодействия между рендер-процессом и основным процессом
contextBridge.exposeInMainWorld("electronAPI", {
 // Создаём функцию openURL, доступную в рендер-процессе, которая отправляет сообщение в основной процесс
 openURL: (url) => ipcRenderer.send("open-url", url),
});

document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.getElementById('tabs-container');
    const urlBar = document.getElementById('url-bar');
    const goButton = document.getElementById('go-button');
    const newTabButton = document.getElementById('new-tab-button');
    const browserContent = document.getElementById('browser-content');
  
    let tabs = [];
    let activeTab = null;
  
    // Функция для создания новой вкладки
    function createNewTab(url = 'about:blank') {
      const tab = document.createElement('div');
      tab.classList.add('tab');
      tab.dataset.url = url;
  
      const tabTitle = document.createElement('span');
      tabTitle.classList.add('tab-title');
      tabTitle.textContent = 'Новая вкладка';
  
      const tabClose = document.createElement('span');
      tabClose.classList.add('tab-close');
      tabClose.textContent = '×';
  
      tab.appendChild(tabTitle);
      tab.appendChild(tabClose);
      tabsContainer.appendChild(tab);
  
      const iframe = document.createElement('iframe');
      iframe.classList.add('tab-content');
      iframe.src = url;
      browserContent.appendChild(iframe);
  
      // Обновляем заголовок вкладки при загрузке страницы
      iframe.addEventListener('load', () => {
        const title = iframe.contentDocument?.title || iframe.src;
        tabTitle.textContent = title || 'Новая вкладка';
      });
  
      tabs.push({ tab, iframe });
  
      setActiveTab(tab, iframe);
  
      // Закрытие вкладки
      tabClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tab);
      });
  
      // Переключение на вкладку
      tab.addEventListener('click', () => {
        setActiveTab(tab, iframe);
      });
    }
  
    // Функция для установки активной вкладки
    function setActiveTab(tab, iframe) {
      if (activeTab) {
        activeTab.tab.classList.remove('active');
        activeTab.iframe.classList.remove('active');
      }
  
      tab.classList.add('active');
      iframe.classList.add('active');
      activeTab = { tab, iframe };
      urlBar.value = iframe.src;
    }
  
    // Функция для закрытия вкладки
    function closeTab(tab) {
      const index = tabs.findIndex(t => t.tab === tab);
      if (index !== -1) {
        const [removedTab] = tabs.splice(index, 1);
        removedTab.tab.remove();
        removedTab.iframe.remove();
  
        if (tabs.length > 0) {
          setActiveTab(tabs[0].tab, tabs[0].iframe);
        } else {
          createNewTab();
        }
      }
    }
  
    // Обработчик для кнопки "Перейти"
    goButton.addEventListener('click', () => {
      const url = urlBar.value;
      if (activeTab) {
        activeTab.iframe.src = url;
        activeTab.tab.dataset.url = url;
      }
    });
  
    // Обработчик для кнопки "Новая вкладка"
    newTabButton.addEventListener('click', () => {
      createNewTab();
    });
  
    // Обработчик для поисковой строки (Enter)
    urlBar.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const url = urlBar.value;
        if (activeTab) {
          activeTab.iframe.src = url;
          activeTab.tab.dataset.url = url;
        }
      }
    });
  
    // Создаем первую вкладку при загрузке
    createNewTab();
  });