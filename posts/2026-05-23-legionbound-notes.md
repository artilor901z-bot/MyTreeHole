---
title: Legionbound · 简记
date: 2026-05-23
category: game
tags: ["自走棋", "Legionbound", "roguelite", "笔记"]
mood: 充盈
---

最近玩了下 **Legionbound**。
想为毕设找点灵感。

不过现在没啥兴致直接打开 engine——
就先文字 mark 一下。

简单说，这游戏是团本自走棋 + roguelite。
屏幕上最多能站 50 个英雄。
30 多个职业，每个职业都有自己的 synergy 子分支。

边玩边记一些 notes——

---

## 1. 上限高，视觉满足感离谱

普通自走棋你最多放 8 个、9 个单位。
Legionbound 直接给你 **50 个的上限**。

视觉上、操作上、build 上——
都不是一个量级的东西。

第一次塞满 50 个单位、看到整面屏幕都是自己的人在和敌人对砍——
那个 satisfaction 真的不是常规自走棋能给的。

它把"军团（Legion）"这件事在数字上 literally 做出来了。

---

## 2. Ascension 这个机制太巧了

这个是它最 unique 的地方。

常规自走棋的"合成"是三合一同等级单位升星。
Legionbound 不是这套。

它的合成叫 **Ascension**——
你可以把**两个不同的角色**合并成一个**更强的混合角色**。

这就让每一次"合"都不是机械操作，
而是一次**选择**：

- 谁和谁合？
- 合出来什么职业组合？
- 保留谁的技能、牺牲谁？
- 这次 Ascension 是为了眼前这一波，还是为了 5 波之后那个 boss？

"合成"从一个 mechanical action 变成了一道 puzzle。

> 这一点我觉得对做 game design 真的很启发——
> 把一个"必做动作"升级成"必须思考的选择"，
> 整个 loop 的密度就完全不一样了。

---

## 3. Synergy 永远算不完

30 多个职业 × 每个都有 subclass synergy。
前排后排会影响发挥。
法术施放的时机会改变战局。

也就是说每一回合你都在做一道**多变量优化题**——

- 我手上这些人能 stack 什么 synergy？
- 谁该放前排、谁该放后排？
- 我赌哪个方向？下一波是 melee 多还是 caster 多？
- 这个新单位是值得吸进来、还是直接 Ascension 喂掉？

这种"每一回合都要想"的设计让游戏永远不会 boring。
而且每一局思考的 surface 不一样。

---

## 4. Meta progression 做得很克制

run 之间死了不是白死。
你能解锁新的角色、新的职业、新的初始配置。
有 skill tree 可以慢慢点，而且——

**可以随时 respec。**

这一点尤其重要。
"随时 respec" 让 build 实验的成本变得很低。
你不会因为点错一个天赋就后悔一整局。

很多 roguelite 在这一点上做得很差——
迫使玩家 commit 自己其实还没想清楚的选择，
然后下一局又被同样的 commit 锁住。

Legionbound 这里很聪明：
**run 内的选择是 commitment，**
**meta 层的选择不是。**

这两个层次的弹性区分给得很好。

---

## 5. 上瘾的根本

想了一下，
我觉得这游戏上头的核心是：

它把"组队"这件事的**两种不同 satisfaction** 同时塞进了一个 loop——

- 一是 **build 自己的小宇宙**（synergy / 位置 / Ascension 选择）
- 二是 **看着自己 build 出来的东西真的能打**（数十个单位同时挥砍的视觉冲击）

很多自走棋只有第一种 satisfaction，
战斗本身只是 build 的"validation"。

Legionbound 把战斗本身也做成了 satisfaction，
所以两种愉悦在同一局里都能 cash 一次。

加上 run 短、节奏快——
特别容易"再来一局"。

然后一局接一局，
就停不下来。

---

## 一些 random notes

- **Ascension** 这个名字翻译成 "升华" 会不会更精准？「合成」太弱了，丢了那种 "two become one and rise" 的感觉。
- "团本自走棋" 这个标签其实有点 narrow。它更接近 `autobattler × roguelite × team builder` 三者的 hybrid。
- 突然意识到——这种 "每一次合并都是 trade-off" 的设计模式，对我自己在做的东西其实有 inspiration。我手上那个项目里也有一个 "聚合 / 重组" 的环节，之前一直觉得太 mechanical，没有 thinking 的空间。也许可以借鉴一下 Ascension 的双角色融合 + skill 取舍的思路。
- 50 个单位同框战斗的时候帧数会掉。但说实话——那个数字本身就带来一种"对不起就是值"的感觉。
