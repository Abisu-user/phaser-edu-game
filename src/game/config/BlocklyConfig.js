import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { COMMAND_DICT } from './CommandList';

export const setupBlockly = (blocklyDiv, currentLevel) => {

  // 1. 根據 COMMAND_DICT 動態註冊所有自訂積木 (Action & Sensor)
  COMMAND_DICT.forEach(def => {
    if (def.type === 'logic') return; // 邏輯類使用 Blockly 內建積木，跳過

    if (!Blockly.Blocks[def.id]) {
      Blockly.Blocks[def.id] = {
        init: function () {
          if (def.type === 'action') {
            this.jsonInit({
              type: def.id,
              message0: def.label,
              previousStatement: null,
              nextStatement: null,
              colour: 160,
            });
          } else if (def.type === 'sensor') {
            this.jsonInit({
              type: def.id,
              message0: def.label,
              output: 'Boolean',
              colour: 210,
            });
          }
        }
      };

      javascriptGenerator.forBlock[def.id] = function () {
        if (def.type === 'action') {
          return `await scene.addCommand("${def.id}");\n`;
        } else if (def.type === 'sensor') {
          return [`await scene.checkSensor("${def.id}")`, javascriptGenerator.ORDER_FUNCTION_CALL];
        }
      };
    }
  });

  // 2. 取得此關卡開放的指令 ID
  const availableCommands = currentLevel?.available_commands
    ?? currentLevel?.availableCommands
    ?? ['moveRight', 'attack'];

  // [新增] 判斷 if 與 else 是否同時開放，決定要顯示哪種變體
  const hasIf   = availableCommands.includes('if');
  const hasElse = availableCommands.includes('else');

 // 3. 組裝 Toolbox XML
  let actionXML  = '';
  let sensorXML  = '';
  let logicXML   = '';

  // [除錯] 確認這一關到底收到了哪些積木指令？
  console.log('--- 開始生成 Toolbox ---');
  console.log('當前關卡收到的 availableCommands:', availableCommands);

  availableCommands.forEach(cmdId => {
    // [除錯] 追蹤每一個積木的處理狀況
    console.log(`正在處理積木 ID: ${cmdId}`);

    const builtInLogic = ['for', 'while', 'if', 'else', 'function'];
    
    if (builtInLogic.includes(cmdId)) {
      console.log(`✅ 成功辨識為內建邏輯積木: ${cmdId}`);
      
      switch (cmdId) {
        case 'for':
          logicXML += '<block type="controls_for_ext"></block>';
          break;
        case 'while':
          logicXML += '<block type="controls_whileUntil"></block>';
          break;
        case 'if':
          logicXML += '<block type="controls_if"></block>';
          // 檢查是否有 else 變體
          if (availableCommands.includes('else')) {
            logicXML += '<block type="controls_if"><mutation else="1"></mutation></block>';
          }
          break;
        case 'else':
          // else 已經合併在 if 裡面處理，這邊跳過
          break;
        case 'function':
          logicXML += '<block type="procedures_defnoreturn"></block>';
          logicXML += '<block type="procedures_callnoreturn"></block>';
          break;
      }
      return; // 內建邏輯處理完畢，提早 return 進入下一個
    }

    const cmdDef = COMMAND_DICT.find(c => c.id === cmdId);
    if (!cmdDef) {
      console.warn(`⚠️ 警告: 找不到 ${cmdId} 的設定，它既不是內建積木，也不在 COMMAND_DICT 中！`);
      return;
    }

    if (cmdDef.type === 'action') {
      actionXML += `<block type="${cmdId}"></block>`;
    }
    else if (cmdDef.type === 'sensor') {
      sensorXML += `<block type="${cmdId}"></block>`;
    }
  });

  // [除錯] 最後檢查拼裝出來的 XML 字串是否有東西
  console.log('最終的 logicXML 字串:', logicXML);
  console.log('------------------------');

  // 4. 組合最終 Toolbox XML（有內容才顯示該分類）
  // [新增] 當 function 積木存在時，加入 Procedures 分類
  const hasProcedures = availableCommands.includes('function');

  const toolboxXML = `
    <xml xmlns="https://developers.google.com/blockly/xml">
      ${actionXML ? `<category name="動作指令" colour="160">${actionXML}</category>` : ''}
      ${sensorXML ? `<category name="感知能力" colour="210">${sensorXML}</category>` : ''}
      ${logicXML  ? `<category name="邏輯控制" colour="290">${logicXML}</category>`  : ''}
      ${hasProcedures ? `<category name="自訂函式" colour="290" custom="PROCEDURE"></category>` : ''}
    </xml>
  `;

  // 5. 初始化並回傳工作區
  blocklyDiv.innerHTML = '';
  return Blockly.inject(blocklyDiv, {
    toolbox: toolboxXML,
    theme: Blockly.Themes.Dark,
    zoom: { controls: true, wheel: true, startScale: 1.1 }
  });
};