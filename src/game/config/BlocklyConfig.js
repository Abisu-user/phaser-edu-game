// src/game/config/BlocklyConfig.js
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// 將 currentLevel 傳入以動態產生工具列
export const setupBlockly = (blocklyDiv, currentLevel) => {
  
  // 1. 定義所有動作積木與其對應的代碼 (加上 await)
  const actionBlocks = [
    { type: 'moveUp', message0: '⬆️ 向上走' },
    { type: 'moveDown', message0: '⬇️ 向下走' },
    { type: 'moveLeft', message0: '⬅️ 向左走' },
    { type: 'moveRight', message0: '➡️ 向右走' },
    { type: 'attack', message0: '⚔️ 攻擊' }
  ];

  actionBlocks.forEach(def => {
    if (!Blockly.Blocks[def.type]) {
      Blockly.Blocks[def.type] = {
        init: function() {
          this.jsonInit({
            type: def.type,
            message0: def.message0,
            previousStatement: null,
            nextStatement: null,
            colour: 160,
          });
        }
      };
      javascriptGenerator.forBlock[def.type] = function() {
        // 關鍵：加上 await 讓 Phaser 動畫播完才執行下一個積木
        return `await scene.addCommand("${def.type}");\n`; 
      };
    }
  });

  // 2. 定義感知積木 (會回傳 Boolean，可放入 if 中)
  if (!Blockly.Blocks['isObstacleAhead']) {
    Blockly.Blocks['isObstacleAhead'] = {
      init: function() {
        this.jsonInit({ type: "isObstacleAhead", message0: "👁️ 前方有障礙物", output: "Boolean", colour: 210 });
      }
    };
    javascriptGenerator.forBlock['isObstacleAhead'] = function() {
      return ['await scene.checkObstacleAhead()', javascriptGenerator.ORDER_FUNCTION_CALL];
    };
  }

  if (!Blockly.Blocks['isEnemyNear']) {
    Blockly.Blocks['isEnemyNear'] = {
      init: function() {
        this.jsonInit({ type: "isEnemyNear", message0: "👁️ 敵人就在旁邊", output: "Boolean", colour: 210 });
      }
    };
    javascriptGenerator.forBlock['isEnemyNear'] = function() {
      return ['await scene.checkEnemyNear()', javascriptGenerator.ORDER_FUNCTION_CALL];
    };
  }

  // 3. 根據關卡設定，動態組裝左側工具列 (Toolbox)
  // 加入防呆機制：如果 currentLevel 沒讀到，預設給基本指令
  const availableCommands = currentLevel?.availableCommands || ['moveRight', 'attack'];
  
  // 動作指令：過濾掉邏輯與感知指令
  let actionXML = availableCommands
    .filter(cmd => !['if', 'else', 'repeat', 'while', 'function', 'isObstacleAhead', 'isEnemyNear'].includes(cmd))
    .map(cmd => `<block type="${cmd}"></block>`).join('');
  
  // 感知指令
  let sensorXML = '';
  if (availableCommands.includes('isObstacleAhead')) sensorXML += '<block type="isObstacleAhead"></block>';
  if (availableCommands.includes('isEnemyNear')) sensorXML += '<block type="isEnemyNear"></block>';

  // 邏輯控制指令
  let logicXML = '';
  if (availableCommands.includes('repeat')) logicXML += '<block type="controls_repeat_ext"></block>';
  if (availableCommands.includes('while')) logicXML += '<block type="controls_whileUntil"></block>';
  if (availableCommands.includes('if') || availableCommands.includes('else')) logicXML += '<block type="controls_if"></block>';
  if (availableCommands.includes('function')) {
    logicXML += '<block type="procedures_defnoreturn"></block><block type="procedures_callnoreturn"></block>';
  }

  // 組合 XML
  const toolboxXML = `
    <xml xmlns="https://developers.google.com/blockly/xml">
      <category name="動作指令" colour="160">${actionXML}</category>
      ${sensorXML ? `<category name="感知能力" colour="210">${sensorXML}</category>` : ''}
      ${logicXML ? `<category name="邏輯控制" colour="290">${logicXML}</category>` : ''}
    </xml>
  `;

  // 4. 初始化並回傳工作區
  blocklyDiv.innerHTML = ''; // 清空舊的
  return Blockly.inject(blocklyDiv, {
    toolbox: toolboxXML,
    theme: Blockly.Themes.Dark,
    zoom: { controls: true, wheel: true, startScale: 1.1 }
  });
};