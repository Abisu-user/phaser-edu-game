// src/game/blocklyConfig.js
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export const setupBlockly = (blocklyDiv) => {
  // 1. 定義 Blockly 積木 (向右走一步)
  const moveRightBlockConfig = {
    "type": "move_right",
    "message0": "向右走一步",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "讓角色向右移動",
    "helpUrl": ""
  };
  
  // 避免重複定義報錯
  if (!Blockly.Blocks['move_right']) {
    Blockly.Blocks['move_right'] = {
      init: function() { this.jsonInit(moveRightBlockConfig); }
    };
  }

  // 2. 定義積木轉換成程式碼的邏輯
  javascriptGenerator.forBlock['move_right'] = function(block, generator) {
    return 'scene.addCommand("move_right");\n'; 
  };

  // 3. 設定左側工具列 (Toolbox)
  const toolbox = {
    "kind": "categoryToolbox",
    "contents": [
      {
        "kind": "category",
        "name": "移動指令",
        "colour": 160,
        "contents": [
          { "kind": "block", "type": "move_right" }
        ]
      }
    ]
  };
  
  // 4. 注入並回傳工作區 (Workspace)
  const workspace = Blockly.inject(blocklyDiv, { 
    toolbox: toolbox,
    theme: Blockly.Themes.Dark, // 暗黑主題
    zoom: { controls: true, wheel: true, startScale: 1.5 }
  });

  return workspace;
};