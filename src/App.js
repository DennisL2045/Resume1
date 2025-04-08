import React, { useState, useRef } from 'react';
import './App.css';

function TextParagraphs({ text, highlightFirst = false }) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  return lines.map((line, index) => {
    if (highlightFirst && index === 0) {
      return <p key={index} className="project-first-line">{line}</p>;
    }
    return <p key={index}>{line}</p>;
  });
}

function getAngleDiff(target, current) {
  let diff = target - current;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

function RotaryKnob({ sections, rotationAngle, onSegmentClick, onRotationChange }) {
  const containerRef = useRef(null);
  const anglePerSegment = 360 / sections.length;

  const normalizeAngle = (angle) => {
    let a = angle % 360;
    if (a < 0) a += 360;
    return a;
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    const initialRotation = rotationAngle;

    const handleMouseMove = (ev) => {
      ev.preventDefault();
      const currentAngle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180 / Math.PI;
      const diff = currentAngle - startAngle;
      onRotationChange(initialRotation + diff);
    };

    const handleMouseUp = (ev) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      const endAngle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180 / Math.PI;
      const diff = endAngle - startAngle;
      let newRotation = initialRotation + diff;
      let normalized = normalizeAngle(newRotation);

      // 用 helper 找到最短角差至各候選區段
      let bestIndex = 0;
      let smallestDiff = Infinity;
      for (let i = 0; i < sections.length; i++) {
        let candidate = i * anglePerSegment;
        let d = getAngleDiff(candidate, normalized);
        if (Math.abs(d) < Math.abs(smallestDiff)) {
          smallestDiff = d;
          bestIndex = i;
        }
      }
      newRotation += smallestDiff;
      onRotationChange(newRotation);
      onSegmentClick(bestIndex, newRotation);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 點擊標籤時：依據目前旋轉角度計算最短路徑
  const handleLabelClick = (index, e) => {
    e.stopPropagation();
    const normalized = normalizeAngle(rotationAngle);
    const targetAngle = index * anglePerSegment;
    const diff = getAngleDiff(targetAngle, normalized);
    const finalRotation = rotationAngle + diff;
    onSegmentClick(index, finalRotation);
  };

  return (
    <div
      ref={containerRef}
      className="rotary-knob-container"
      onMouseDown={handleMouseDown}
    >
      <div
        className="rotary-knob"
        style={{ transform: `translate(-50%, -50%) rotate(${rotationAngle}deg)` }}
      >
        <div className="arrow-indicator"></div>
      </div>
      <div className="rotary-knob-labels">
        <div className="rotary-knoob-tips">
          <p>點擊想看的部分</p>
        </div>
        {sections.map((section, index) => {
          const rotation = index * anglePerSegment;
          return (
            <span
              key={index}
              className="knob-label"
              data-index={index}
              style={{
                '--rotation': `${rotation}deg`,
                '--label-distance': '120px',
              }}
              onClick={(e) => handleLabelClick(index, e)}
            >
              {section}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SectionDisplay({ activeIndex, sections, projects, selfIntroductionText }) {
  const sectionTitle = sections[activeIndex];
  const contentMapping = {
    "專長": (
      <section className="resume-section" id="skills">
        <h2>專長</h2>
        <ul>
          <li>前端：HTML、ASPX、JavaScript、RESTful API互動、React.js、Jest、CSS、SCSS</li>
          <br></br>
          <li>後端：VB、Node.js、Socket即時資料交握</li>
          <br></br>
          <li>介面視覺設計：Figma、Mockplus</li>
        </ul>
      </section>
    ),
    "自傳": (
      <section className="resume-section" id="self-introduction">
        <h2>自傳</h2>
        <TextParagraphs text={selfIntroductionText} />
      </section>
    ),
    "工作經歷": (
      <section className="resume-section" id="work-experience">
        <h2>工作經歷</h2>
        <div className="experience-item">
          <h3>軟體工程師 有量股份有限公司</h3>
          <p>2023/7~仍在職</p>
          <ul>
            <li>滿足公司內部程式需求，改善原有費時費工框架</li>
            <br></br>
            <li>達成提升產能及數據集中化管理</li>
            <br></br>
            <li>進一步回饋出數據圖表資料分析</li>
          </ul>
        </div>
      </section>
    ),
    "教育背景": (
      <section className="resume-section" id="education">
        <h2>教育背景</h2>
        <div className="education-item">
          <h3>中原大學 - 資訊管理系</h3>
          <p>2018/09 - 2022/06</p>
        </div>
      </section>
    ),
    "語言": (
      <section className="resume-section" id="Language">
        <h2>語言</h2>
        <ul>
          <li>英文：聽/略懂 說/略懂 讀/中等 寫/略懂</li>
        </ul>
      </section>
    ),
    "專案": (
      <section className="resume-section" id="Project">
        <h2>專案</h2>
        <ul>
          {projects.map((projectText, index) => (
            <li key={index}>
              <TextParagraphs text={projectText} highlightFirst={true} />
            </li>
          ))}
        </ul>
      </section>
    ),
  };
  return contentMapping[sectionTitle] || null;
}

function BackToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <button className="back-to-top" onClick={scrollToTop}>
      <img src="https://img.icons8.com/ios/50/FFFFFF/up--v1.png" alt="Back to top" />
    </button>
  );
}

function App() {
  const selfIntroductionText = `網站前端開發經驗3年以上，主要以React.js和原生JavaScript為主，同時具備良好切版能力以及網頁設計美感，且在與User的交流中能迅速理解需求來設計出相對應的UI/UX。
  後來在團隊需求的狀況下，配合踏入後端領域，大多透過VB.net編寫API路由和邏輯層架構，並與前端進行前後端API串接或是Code-Behind開發，能針對新舊架構進行不同手段開發，目前正在積極學習C#，來擴展更多元的開發實力。
  而為了因應產線或是User等等的需求，在一定限度下遵循Clean Architecture及SOLID的單一職責、依賴反轉、介面隔離原則，開發出好維護且優雅的前後端相接和處理層面的結構，來達到更快速且滾動式的網站擴充和維運。
  有時候會心血來潮開發一些特別的個人私心網站，如音樂庫、五子棋小遊戲、小說閱讀器等等，對我來說就是讓我的生活變得更加方便有趣的開發，未來也還有一些點子待開發，在滿足自我的前提下達到做中學，以興趣來加強能力拓展見聞。
  經驗：
  
  1.儲能EMS能源管理系統開發、儲能EMS效益分析系統開發
  
  2.產線人工組裝線數據中心化整合（多方面分析）
  
  3.人工測試站點，轉型數位化管理
  
  4.WebSocket伺服器與客戶端建制，實現雙向即時對話
  
  5.會議管理與紀錄網站開發
  
  6.ISO 27001資訊管理業務建制
  
  7.CMMC美國聯邦資訊安全管理建制`;

  const project1Text = `組裝線智控網站
  2024/10~仍在進行
  1.條碼掃描輸入與客製化驗證：快速寫入資料、製令過濾、輸入值檢查，以及字符/數值範圍驗證，確保輸入的資料是正確的值，且根據每一次生產總編號做不同的過濾，確保產線人員能快速選擇而不會看錯或寫錯資料。
  
  2.動態資料表查詢與匯出：具備更新、排序、換頁、多選/全選勾選及按時間範圍匯出excel功能。
  
  3.自定義資料合併報表：讓用戶選擇多個資料表與欄位，採取依自行勾選之欄位順序生成虛擬資料表，用戶能直接在網站上自行新增其需要的資料表與欄位之資料，直接過濾出這些用戶需要的資料，不影響原資料庫並支持虛擬表查詢與匯出excel。
  
  4.網站後台資料操作：支援新增、編輯、刪除資料，以及批量處理與線上數據編輯不需進入資料庫，且可直接在網站上新增或刪除資料表，以及新增刪除欄位，並設置權限只有特別人員有此些功能。
  
  5.自適應搜尋展示：根據資料表實際欄位與資料動態生成搜尋欄位與自適應表格，保持資料展示正確，此種方法可隨時配合資料表的結構更動也不需要更動程式碼。
  
  6.模組全程追蹤與異常檢測：從第一站開始到最後一站全程追蹤模組組裝和裝箱狀況，確保生產履歷無疏漏，即時發現異常或漏刷或資料不對稱情形。
  
  7.現場問題解決與持續優化：提供現場協助、問題排除及接收回饋來達成更多系統優化。
  
  8.結合圖表分析：未來將結合圖表實現更進一步之產能資料分析，以分析良率、工站耗時等等功能。`;

  const project2Text = `EMS （ESS) 開發整合
  2023/8~2023/12
  1.儲能系統資料監視
  
  2.儲能櫃走向監視，協助人員快速檢查運行狀態是否正常及何處錯誤。
  
  2.整合通訊
  
  3.數位電錶數據分析
  
  4.充放電機制管理
  
  5.台電表後頻率監控管理
  
  6.效益資料分析圖表綜合評估管理
  
  7.無人化緊急應變措施管理
  
  8.數據中心化通訊傳輸設計
  
  9.儲能小組上線驗證測試`;

  const project3Text = `會議記錄網站
  2023/10~2023/11
  1.基本會議記錄、該會議與會者列表
  
  2.提供會議預告通知與會者參與
  
  3.線上簽到透過canvas畫板處理
  
  4.排序所有會議列成清單歷史
  
  5.可針對文字做醒目處理擷取重點`;

  const project4Text = `公司即時通
  2024/1~2024/4
  自行設計webSocket server，實現客戶端文字訊息、圖片、錄音檔、影片傳送及接收，且穩定保持多人傳送與接收訊息時，server狀態穩定不斷線。
  
  具備好友新增、群組邀請，個人一對一及群組傳送訊息、已讀統計，追蹤每則訊息每個人的已讀時間、上線狀、訊息搜尋、懶加載功能。
  
  設計平易近人介面及排版，以確保不熟悉的人也能上手使用。`;

  const project5Text = `大學專題 擊退目標我照你
  2021/2~2022/1
  主題：讓老年人能透過有趣的遊戲去觀察自己的反應力是否有下降太快的趨勢，而有趣的是我們設計成主治醫生及家屬也能透過查詢帳號，並觀察成績折線圖的變化是進步或是下滑。
  
  
  
  發想過程：我本身喜歡玩射擊遊戲，而射擊遊戲很多吃反應力以及注意力，某天在進行遊戲時突然發想到如果讓老年人也進行這類FPS的遊戲，會有什麼樣的效果，於是就促成這份專題的誕生。
  
  
  
  全程Unity製作，使用Figma進行介面規劃。
  
  
  
  專題的構想受到指導教授以及評審教授的青睞，他們認為這份題目很有趣且特別，接觸到長照這塊也能符合時下流行的遊戲，如果能增加在手機或平板端遊玩就更加優秀了。`;

  const project6Text = `個人興趣開發-1：音樂庫
  2025/1~仍在進行
  目的在於過濾出自己在YT上想聽的音樂，主要抓取日本Hololive團體之音樂，避免掉大雜燴隨便推音樂上來，並將介面設計成自己手順的狀態，改善掉自己覺得YT提供的播放清單功能不方便的缺點。
  
  串接YouTube Data API v3，複製頻道或影片網址取得音樂資料，並存進Firebase，存入Embed+ID來叫出音樂，並設計播放器、重複播放和隨機音樂庫音樂播放。
  
  目前階段仍以收集音樂為優先點，在大量音樂進庫後將開始開發個人播放清單、音樂推播、版型設計，以及收錄直播歌回中的歌曲統整，將明確標出該音樂起始時間和結束時間。`;

  const projects = [project1Text, project2Text, project3Text, project4Text, project5Text, project6Text];
  const navigableSections = ["專長", "自傳", "工作經歷", "教育背景", "語言", "專案"];
  const anglePerSegment = 360 / navigableSections.length;

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [darkMode, setDarkMode] = useState(prefersDark);

  const [activeSection, setActiveSection] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);

  const handleSegmentClick = (targetIndex, finalRotation) => {
    if (typeof finalRotation !== 'number') {
      let currentAngle = rotationAngle % 360;
      if (currentAngle < 0) currentAngle += 360;
      const targetAngle = targetIndex * anglePerSegment;
      let diff = targetAngle - currentAngle;
      if (diff > 180) diff -= 360;
      else if (diff < -180) diff += 360;
      finalRotation = rotationAngle + diff;
    }
    setRotationAngle(finalRotation);
    setActiveSection(targetIndex);
  };

  const handleRotationChange = (newAngle) => {
    setRotationAngle(newAngle);
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <div className={`resume-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="toggle-container">
        <button onClick={toggleDarkMode} className="mode-toggle">
          <span className="material-symbols-outlined icon">
            {darkMode ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>
      <div className="header-knob-container">
        <header className="resume-header">
          <h1 className="resume-name">劉松銘</h1>
          <p>age：24</p>
          <p className="resume-contact">
            <span>Email：sungming099@gmail.com</span>
          </p>
        </header>
        <RotaryKnob
          sections={navigableSections}
          rotationAngle={rotationAngle}
          onSegmentClick={handleSegmentClick}
          onRotationChange={handleRotationChange}
        />
      </div>
      <SectionDisplay
        activeIndex={activeSection}
        sections={navigableSections}
        projects={projects}
        selfIntroductionText={selfIntroductionText}
      />
      <BackToTopButton />
    </div>
  );
}

export default App;
