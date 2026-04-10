import Phaser from 'phaser';

export const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container', // 這個 ID 對應到 Vue 裡面的 div
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // 教學關卡通常是俯視角，不需要重力
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    // 這裡載入圖片，例如：this.load.image('hero', 'assets/hero.png');
}

function create() {
    // 這裡把角色放進場景：this.add.text(100, 100, '遊戲畫面載入成功！', { fill: '#fff' });
}

function update() {
    // 遊戲迴圈
}