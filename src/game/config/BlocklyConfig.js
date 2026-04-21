// src/game/config/BlocklyConfig.js
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { COMMAND_DICT } from './CommandList'; // 確保路徑正確

export const setupBlockly = (blocklyDiv, currentLevel) => {
  
  // 1. 根據 COMMAND_DICT 動態註冊所有自訂積木 (Action & Sensor)
  COMMAND_DICT.forEach(def => {
    // 略過邏輯類，因為邏輯類 (if, while) 是 Blockly 內建的
    if (def.type === 'logic') return; 

    if (!Blockly.Blocks[def.id]) {
      Blockly.Blocks[def.id] = {
        init: function() {
          if (def.type === 'action') {
            // 動作類積木：有上下連接點，沒有回傳值
            this.jsonInit({
              type: def.id,
              message0: def.label,
              previousStatement: null,
              nextStatement: null,
              colour: 160,
            });
          } else if (def.type === 'sensor') {
            // 感知類積木：沒有上下連接點，會回傳 Boolean 值放入條件判斷中
            this.jsonInit({ 
              type: def.id, 
              message0: def.label, 
              output: "Boolean", 
              colour: 210 
            });
          }
        }
      };

      // 註冊對應的 JavaScript 程式碼產生器
      javascriptGenerator.forBlock[def.id] = function() {
        if (def.type === 'action') {
          return `await scene.addCommand("${def.id}");\n`; 
        } else if (def.type === 'sensor') {
          // 將所有感知指令統一呼叫 scene.checkSensor("isWall") 這種格式
          return [`await scene.checkSensor("${def.id}")`, javascriptGenerator.ORDER_FUNCTION_CALL];
        }
      };
    }
  });

  // 2. 取得此關卡開放的指令 ID (防呆預設值)
  const availableCommands = currentLevel?.available_commands || ['moveRight', 'attack'];
  
  // 3. 準備分類的 XML 字串
  let actionXML = '';
  let sensorXML = '';
  let logicXML = '';

  // 4. 依照 availableCommands 篩選並動態組裝 Toolbox
  availableCommands.forEach(cmdId => {
    const cmdDef = COMMAND_DICT.find(c => c.id === cmdId);
    if (!cmdDef) return; // 如果資料庫存了未知的指令，直接略過

    if (cmdDef.type === 'action') {
      actionXML += `<block type="${cmdId}"></block>`;
    } 
    else if (cmdDef.type === 'sensor') {
      sensorXML += `<block type="${cmdId}"></block>`;
    } 
    else if (cmdDef.type === 'logic') {
      // 邏輯類使用 Blockly 內建的積木 type
      if (cmdId === 'repeat') logicXML += '<block type="controls_repeat_ext"></block>';
      if (cmdId === 'while') logicXML += '<block type="controls_whileUntil"></block>';
      if (cmdId === 'if') logicXML += '<block type="controls_if"></block>';
      if (cmdId === 'ifElse') {
        // Blockly 的 if-else 是透過 mutation 擴充的
        logicXML += '<block type="controls_if"><mutation else="1"></mutation></block>';
      }
    }
  });

  // 5. 組合最終的 XML (如果該類別沒有積木，就不要顯示該分類標籤)
  const toolboxXML = `
    <xml xmlns="https://developers.google.com/blockly/xml">
      ${actionXML ? `<category name="動作指令" colour="160">${actionXML}</category>` : ''}
      ${sensorXML ? `<category name="感知能力" colour="210">${sensorXML}</category>` : ''}
      ${logicXML ? `<category name="邏輯控制" colour="290">${logicXML}</category>` : ''}
    </xml>
  `;

  // 6. 初始化並回傳工作區
  blocklyDiv.innerHTML = ''; // 清空舊的
  return Blockly.inject(blocklyDiv, {
    toolbox: toolboxXML,
    theme: Blockly.Themes.Dark,
    zoom: { controls: true, wheel: true, startScale: 1.1 }
  });
};