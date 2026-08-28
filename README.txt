DESPAIR RUNNER — RELEASE 1.1 OFFLINE PWA
PC + iOS

ЧТО НОВОГО
- Полный offline cache игры: HTML, JS, CSS, все спрайты, музыка, голоса и звуки.
- Service Worker: sw.js.
- Audio Range support для iOS, чтобы закэшированные mp3/wav могли играть офлайн.
- OFFLINE READY индикатор на touch-устройствах.
- Double-tap zoom отключён.
- Pinch zoom на игровом экране отключён.
- viewport зафиксирован на scale=1.
- Система 3 слотов и все релизные механики 1.0 сохранены.

ВАЖНО ПРО iPHONE / iPAD
Service Worker на iOS требует secure context.
То есть первый запуск для офлайн-установки должен быть с HTTPS-сайта.

Адрес вида:
http://192.168.0.103:8080
подходит для теста игры по домашней сети, НО Safari не даст такому LAN HTTP-сайту полноценно установить Service Worker.
Поэтому для настоящего офлайна размести эту папку на HTTPS-хостинге (например GitHub Pages / Cloudflare Pages / Netlify), один раз открой в Safari и дождись надписи OFFLINE READY.

ПОСЛЕ ПЕРВОГО HTTPS-ЗАПУСКА НА IOS
1. Дождись OFFLINE READY снизу.
2. Safari -> Поделиться -> На экран «Домой».
3. Запусти игру с иконки.
4. После этого можно включить авиарежим / уйти из дома: игра загружается из локального кэша устройства.
5. Сохранения лежат в localStorage этого web-app и тоже не требуют интернета.

DOUBLE-TAP ZOOM FIX
- maximum-scale=1
- user-scalable=no
- touch-action:none на игровом canvas/управлении
- iOS gesturestart/gesturechange/gestureend preventDefault
- защита от второго touchend в пределах 320 ms

ПРИ ЭТОМ
- одиночные тапы работают;
- D-pad и игровые кнопки работают;
- ползунки настроек остаются интерактивными;
- прокрутка/масштабирование игрового поля не мешают управлению.

СОХРАНЕНО ИЗ 1.0
- 3 независимых save slots;
- ЗАНОВО стирает старый checkpoint ДО запуска 1 уровня;
- checkpoints 5/10/15/19->20;
- mobile controls;
- F2/dev полностью отсутствуют;
- перенос перков;
- BAD END: DESPAIR WINS;
- пользовательский смех Junko, без TTS.
