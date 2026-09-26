import './styles.css';
import { createGame, applyAction, getLegalActions, getPlayerView } from './mahjong/game';
import { createGameController } from './game/controller';
import { renderTable } from './ui/table';
import type { PlayerView, Seat } from './mahjong/game-types';

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`頁面缺少必要的 UI 元素：${selector}`);
  return element;
}

const form = requireElement<HTMLFormElement>('#round-form');
const seedInput = requireElement<HTMLInputElement>('#seed');
const flowerSwitch = requireElement<HTMLInputElement>('#use-flowers');
const message = requireElement<HTMLElement>('#message');
const ruleMode = requireElement<HTMLElement>('#rule-mode');
const wallRemaining = requireElement<HTMLElement>('#wall-remaining');
const roundStatus = requireElement<HTMLElement>('#validation-state');
const roundSeed = requireElement<HTMLElement>('#round-seed');
const seatNames: Record<Seat, string> = { east: '東家（你）', south: '南家', west: '西家', north: '北家' };
let gameNumber = 0;

function showError(text: string): void {
  message.textContent = text;
  message.classList.add('message-error');
}

function render(view: PlayerView): void {
  flowerSwitch.checked = view.mode === 'flowers';
  ruleMode.textContent = view.mode === 'flowers' ? '有花牌規則' : '無花牌規則';
  wallRemaining.textContent = String(view.wallRemaining);
  roundSeed.textContent = String(view.seed);
  roundStatus.textContent = view.phase === 'finished' ? '已結束' : view.legalActions.length ? (view.phase === 'await-discard' ? '輪到你' : '等待應對') : '電腦回合';
  message.classList.remove('message-error');
  if (view.phase === 'finished') {
    message.textContent = view.result?.kind === 'win'
      ? `${seatNames[view.result.winner]}${view.result.method === 'self-draw' ? '自摸' : view.result.method === 'rob-kong' ? '搶槓胡' : '胡牌'}！可以再玩一局。`
      : '牌牆已到保留線，本局流局。可以再玩一局。';
  } else if (view.legalActions.length > 0) {
    message.textContent = view.phase === 'await-discard' ? '輪到你，選一張手牌出牌，或使用可用的動作。' : '有可用的應對動作，請選擇吃、碰、槓、胡或放棄。';
  } else {
    message.textContent = `等待${seatNames[view.activeSeat]}與電腦玩家完成動作…`;
  }
  renderTable(view, action => { controller.dispatch(action); });
}

const controller = createGameController({
  engine: { createGame, applyAction, getLegalActions, getPlayerView },
  onChange: render,
  onError: showError,
  delayMs: 450,
});

function startRound(): void {
  const seed = seedInput.valueAsNumber;
  if (!Number.isFinite(seed) || !Number.isInteger(seed) || seed < 1) {
    showError('Seed 必須是大於 0 的整數。');
    seedInput.setAttribute('aria-invalid', 'true');
    flowerSwitch.checked = controller.getView()?.mode !== 'no-flowers';
    return;
  }
  seedInput.removeAttribute('aria-invalid');
  controller.start({ seed, mode: flowerSwitch.checked ? 'flowers' : 'no-flowers', gameId: `game-${++gameNumber}` });
}
form.addEventListener('submit', event => { event.preventDefault(); startRound(); });
flowerSwitch.addEventListener('change', startRound);
window.addEventListener('pagehide', () => controller.dispose());
if (import.meta.hot) import.meta.hot.dispose(() => controller.dispose());
startRound();
