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