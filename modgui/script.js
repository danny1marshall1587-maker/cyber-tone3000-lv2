function (event) {
    var pedal = event.icon;

    // Built-in catalog metadata matching Tone3000Engine.hpp
    var TONE_MODELS = [
        { id: 0, name: "Martin D-45 Studio Mic (Acoustic)", author: "CyberAudio", category: "Acoustic", desc: "Warm studio condenser mic response converting raw piezo pickup into full woody Dreadnought body", defaultIr: 0, irName: "Neumann U87 Condenser" },
        { id: 1, name: "Taylor 814ce Grand Auditorium", author: "CyberAudio", category: "Acoustic", desc: "Pristine modern acoustic capture with airy top-end sparkle and balanced fingerpicking clarity", defaultIr: 1, irName: "Royer R-121 Ribbon" },
        { id: 2, name: "Gibson J-45 Vintage Round Shoulder", author: "CyberAudio", category: "Acoustic", desc: "Classic vintage woody thud with punchy low-mids for strumming and folk rhythm", defaultIr: 2, irName: "Shure SM7B Dynamic" },
        { id: 3, name: "Guild F-512 12-String Acoustic", author: "CyberAudio", category: "Acoustic", desc: "Shimmering, lush, choir-like acoustic resonance with wide stereo spread feel", defaultIr: 3, irName: "Stereo Room Pair" },
        { id: 4, name: "Fender '65 Deluxe Reverb Blackface", author: "FenderTone", category: "Clean", desc: "Sparkling American clean with scooped mids, bell-like highs, and smooth edge-of-breakup", defaultIr: 4, irName: "Jensen C12N 1x12" },
        { id: 5, name: "Fender '59 Tweed Bassman 4x10", author: "ToneLover", category: "Clean", desc: "Touch-sensitive vintage Tweed breakup with punchy low-end and singing harmonics", defaultIr: 5, irName: "Jensen P10R 4x10" },
        { id: 6, name: "Dumble Overdrive Special (Clean)", author: "BoutiqueAmps", category: "Clean", desc: "Legendary thick, blooming boutique clean with infinite headroom and touch response", defaultIr: 6, irName: "EVM12L 2x12" },
        { id: 7, name: "Matchless DC-30 Chime Channel", author: "BritishTone", category: "Clean", desc: "Iconic Class-A EL84 chime with 3D high-end clarity and harmonic richness", defaultIr: 7, irName: "Alnico Blue 2x12" },
        { id: 8, name: "Vox AC30 Top Boost 1964", author: "JMI_Vintage", category: "Crunch", desc: "The quintessential British Invasion top-boost bite, chime sparkle, and aggressive crunch", defaultIr: 7, irName: "Alnico Blue 2x12" },
        { id: 9, name: "Marshall Bluesbreaker 1962 (JTM45)", author: "PlexiFan", category: "Crunch", desc: "Warm organic tube sag with fat woody cleans pushing into singing creamy blues sustain", defaultIr: 8, irName: "Celestion V30 4x12" },
        { id: 10, name: "Orange Rockerverb 50 MkIII", author: "DoomRigs", category: "Crunch", desc: "Mid-forward British roar with thick velvety low-end and rich harmonic fuzz-edge", defaultIr: 9, irName: "Orange V30 4x12" },
        { id: 11, name: "Marshall JCM800 2203 Classic 80s", author: "HardRock80", category: "High Gain", desc: "Tight, biting 80s rock rhythm with aggressive cut and punchy low end", defaultIr: 8, irName: "Celestion V30 4x12" },
        { id: 12, name: "Soldano SLO-100 Super Lead", author: "LeadKing", category: "High Gain", desc: "Legendary singing boutique high-gain lead channel with infinite sustain and clarity", defaultIr: 10, irName: "Eminence Legend 4x12" },
        { id: 13, name: "Mesa/Boogie Dual Rectifier Multi-Watt", author: "ModernMetal", category: "High Gain", desc: "Massive American wall-of-sound rhythm tone with scooped mids and huge palm-mute thump", defaultIr: 11, irName: "Oversized V30 4x12" },
        { id: 14, name: "Ampeg SVT Classic 8x10 Tube Stack", author: "BassBeast", category: "Bass", desc: "Monumental 300W tube bass tone with earth-shaking low-end authority and growl", defaultIr: 12, irName: "Ampeg 8x10 Sealed" },
        { id: 15, name: "Darkglass Microtubes B7K Ultra", author: "BassPrecision", category: "Bass", desc: "Aggressive modern bass preamp with clinical attack clank and biting low-end definition", defaultIr: 13, irName: "Neodymium 4x10" }
    ];

    var currentModelId = 0;
    var currentIrId = 0;
    var audioCtx = null;

    function updateLcdDisplay(modelId) {
        var m = TONE_MODELS[modelId] || TONE_MODELS[0];
        pedal.find('[data-role="model-name"]').text(m.name);
        pedal.find('[data-role="ir-name"]').text("Cab: " + m.irName);
    }

    // =========================================================================
    // Rotary Knob Setup
    // =========================================================================
    function initKnobs() {
        pedal.find('.custom-knob-dial').each(function () {
            var knob = $(this);
            var symbol = knob.data('symbol');
            var min = parseFloat(knob.data('min'));
            var max = parseFloat(knob.data('max'));
            var def = parseFloat(knob.data('default'));

            var isDragging = false;
            var startY = 0;
            var startVal = def;

            function setKnobRotation(val) {
                var norm = (val - min) / (max - min);
                var deg = -140 + norm * 280;
                knob.find('.knob-rotor').css('transform', 'rotate(' + deg + 'deg)');
            }

            setKnobRotation(def);

            knob.on('mousedown touchstart', function (e) {
                e.preventDefault();
                e.stopPropagation();
                isDragging = true;
                startY = e.pageY || (e.originalEvent.touches && e.originalEvent.touches[0].pageY);

                var hiddenInput = pedal.find('.mod-knob-image[mod-port-symbol="' + symbol + '"]');
                var curVal = parseFloat(hiddenInput.val() || def);
                startVal = isNaN(curVal) ? def : curVal;

                $(document).on('mousemove.t3k touchmove.t3k', function (ev) {
                    if (!isDragging) return;
                    var curY = ev.pageY || (ev.originalEvent.touches && ev.originalEvent.touches[0].pageY);
                    var dy = startY - curY;
                    var range = max - min;
                    var newVal = Math.min(max, Math.max(min, startVal + (dy / 150) * range));

                    setKnobRotation(newVal);
                    hiddenInput.val(newVal).trigger('change');
                    if (event.set_port_value) {
                        event.set_port_value(symbol, newVal);
                    }
                });

                $(document).on('mouseup.t3k touchend.t3k', function () {
                    isDragging = false;
                    $(document).off('mousemove.t3k touchmove.t3k');
                    $(document).off('mouseup.t3k touchend.t3k');
                });
            });
        });
    }

    // =========================================================================
    // Full-Screen Interactive Overlay Modal (Tuner-Style Addon)
    // =========================================================================
    function openTone3000Overlay() {
        var overlayId = 't3k-overlay-modal-' + (pedal.attr('id') || 'default');
        var existing = $('#' + overlayId);
        if (existing.length) {
            existing.fadeIn(200);
            return;
        }

        var overlayHtml = [
            '<div id="' + overlayId + '" class="t3k-overlay-backdrop">',
            '  <div class="t3k-modal-window">',
            '    <!-- Header -->',
            '    <div class="t3k-modal-header">',
            '      <div class="t3k-modal-title-box">',
            '        <div class="t3k-modal-logo">TONE<span>3000</span></div>',
            '        <div class="t3k-modal-cloud-status">&#9679; CONNECTED TO CLOUD</div>',
            '      </div>',
            '      <button type="button" class="t3k-close-btn" title="Close Overlay">&times;</button>',
            '    </div>',
            '',
            '    <!-- Interactive Signal Chain -->',
            '    <div class="t3k-signal-chain-bar">',
            '      <div class="t3k-chain-title">Interactive Signal Chain (Click block to view)</div>',
            '      <div class="t3k-chain-blocks-wrapper">',
            '        <div class="t3k-chain-block active" data-chain-block="gate">',
            '          <div class="t3k-block-badge">INPUT BLOCK</div>',
            '          <div class="t3k-block-name">1. Noise Gate</div>',
            '        </div>',
            '        <div class="t3k-chain-arrow">&rarr;</div>',
            '        <div class="t3k-chain-block active" data-chain-block="nam">',
            '          <div class="t3k-block-badge">NEURAL CORE</div>',
            '          <div class="t3k-block-name t3k-chain-active-nam">2. ' + TONE_MODELS[currentModelId].name + '</div>',
            '        </div>',
            '        <div class="t3k-chain-arrow">&rarr;</div>',
            '        <div class="t3k-chain-block active" data-chain-block="ir">',
            '          <div class="t3k-block-badge">CONVOLVER</div>',
            '          <div class="t3k-block-name t3k-chain-active-ir">3. ' + TONE_MODELS[currentModelId].irName + '</div>',
            '        </div>',
            '        <div class="t3k-chain-arrow">&rarr;</div>',
            '        <div class="t3k-chain-block active" data-chain-block="eq">',
            '          <div class="t3k-block-badge">MASTER EQ</div>',
            '          <div class="t3k-block-name">4. 3-Band Tone Stack</div>',
            '        </div>',
            '      </div>',
            '    </div>',
            '',
            '    <!-- Browser Controls -->',
            '    <div class="t3k-browser-controls">',
            '      <div class="t3k-search-input-box">',
            '        <span class="t3k-search-icon">&#128269;</span>',
            '        <input type="text" class="t3k-search-input" placeholder="Search TONE3000 community captures (e.g. Acoustic, Martin D-45, Deluxe, Plexi, Soldano)...">',
            '      </div>',
            '      <div class="t3k-filter-pills">',
            '        <button type="button" class="t3k-pill active" data-cat="all">All Tones</button>',
            '        <button type="button" class="t3k-pill" data-cat="Acoustic">Acoustic Guitars & Mics</button>',
            '        <button type="button" class="t3k-pill" data-cat="Clean">Clean Amps</button>',
            '        <button type="button" class="t3k-pill" data-cat="Crunch">Edge of Breakup</button>',
            '        <button type="button" class="t3k-pill" data-cat="High Gain">High Gain Leads</button>',
            '        <button type="button" class="t3k-pill" data-cat="Bass">Bass Rigs</button>',
            '      </div>',
            '    </div>',
            '',
            '    <!-- Cards Grid -->',
            '    <div class="t3k-cards-grid"></div>',
            '',
            '    <!-- Drag & Drop Zone -->',
            '    <div class="t3k-dropzone-section">',
            '      <div class="t3k-dropzone-box">',
            '        <div class="t3k-dropzone-text"><strong>Drag & Drop local .nam model or .wav IR file</strong> to load directly into the pedal</div>',
            '      </div>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('\n');

        var overlay = $(overlayHtml);
        $('body').append(overlay);
        overlay.hide().fadeIn(200);

        function renderCards(filterCat, searchStr) {
            var grid = overlay.find('.t3k-cards-grid');
            grid.empty();

            var filtered = TONE_MODELS.filter(function (m) {
                var matchesCat = (filterCat === 'all' || m.category === filterCat);
                var matchesSearch = true;
                if (searchStr && searchStr.trim().length > 0) {
                    var s = searchStr.toLowerCase().trim();
                    matchesSearch = (m.name.toLowerCase().indexOf(s) !== -1 ||
                                     m.desc.toLowerCase().indexOf(s) !== -1 ||
                                     m.author.toLowerCase().indexOf(s) !== -1);
                }
                return matchesCat && matchesSearch;
            });

            filtered.forEach(function (m) {
                var isCurrent = (m.id === currentModelId);
                var card = $([
                    '<div class="t3k-tone-card' + (isCurrent ? ' current-active' : '') + '" data-model-id="' + m.id + '">',
                    '  <div class="t3k-card-header">',
                    '    <div class="t3k-card-title">' + m.name + '</div>',
                    '    <span class="t3k-card-badge">' + m.category.toUpperCase() + '</span>',
                    '  </div>',
                    '  <div class="t3k-card-desc">' + m.desc + '</div>',
                    '  <div class="t3k-card-footer">',
                    '    <div class="t3k-card-author">Captured by ' + m.author + '</div>',
                    '    <div class="t3k-card-buttons">',
                    '      <button type="button" class="t3k-btn-preview" data-id="' + m.id + '">&#9658; Audition</button>',
                    '      <button type="button" class="t3k-btn-load' + (isCurrent ? ' loaded' : '') + '" data-id="' + m.id + '">' + (isCurrent ? 'Active &#10003;' : 'Load &rarr;') + '</button>',
                    '    </div>',
                    '  </div>',
                    '</div>'
                ].join(''));

                // Audition audio preview
                card.find('.t3k-btn-preview').on('click', function (e) {
                    e.stopPropagation();
                    playAudition(m.id);
                });

                // Load tone into pedal
                card.find('.t3k-btn-load').on('click', function (e) {
                    e.stopPropagation();
                    loadModelToPedal(m.id);
                });

                grid.append(card);
            });
        }

        renderCards('all', '');

        // Search event
        overlay.find('.t3k-search-input').on('input', function () {
            var activeCat = overlay.find('.t3k-pill.active').data('cat') || 'all';
            renderCards(activeCat, $(this).val());
        });

        // Pill filters
        overlay.find('.t3k-pill').on('click', function () {
            overlay.find('.t3k-pill').removeClass('active');
            $(this).addClass('active');
            var search = overlay.find('.t3k-search-input').val();
            renderCards($(this).data('cat'), search);
        });

        // Close handlers
        function closeOverlay() {
            overlay.fadeOut(150);
        }

        overlay.find('.t3k-close-btn').on('click', closeOverlay);
        overlay.on('click', function (e) {
            if ($(e.target).hasClass('t3k-overlay-backdrop')) {
                closeOverlay();
            }
        });

        $(document).on('keydown.t3k_esc', function (e) {
            if (e.keyCode === 27) closeOverlay();
        });
    }

    function loadModelToPedal(modelId) {
        currentModelId = modelId;
        var m = TONE_MODELS[modelId] || TONE_MODELS[0];

        // Send port updates to LV2 engine
        if (event.set_port_value) {
            event.set_port_value('model', modelId);
            event.set_port_value('ir', m.defaultIr);
        }

        // Update hidden inputs
        pedal.find('.mod-knob-image[mod-port-symbol="model"]').val(modelId).trigger('change');
        pedal.find('.mod-knob-image[mod-port-symbol="ir"]').val(m.defaultIr).trigger('change');

        // Update pedal LCD
        updateLcdDisplay(modelId);

        // Update overlay UI
        $('.t3k-chain-active-nam').text('2. ' + m.name);
        $('.t3k-chain-active-ir').text('3. ' + m.irName);
        $('.t3k-tone-card').removeClass('current-active');
        $('.t3k-tone-card[data-model-id="' + modelId + '"]').addClass('current-active');
        $('.t3k-btn-load').removeClass('loaded').html('Load &rarr;');
        $('.t3k-btn-load[data-id="' + modelId + '"]').addClass('loaded').html('Active &#10003;');
    }

    function playAudition(modelId) {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var now = audioCtx.currentTime;
            var freqs = [196.00, 246.94, 293.66, 392.00, 493.88]; // G major acoustic chord

            freqs.forEach(function (f, i) {
                var osc = audioCtx.createOscillator();
                var gain = audioCtx.createGain();
                osc.type = (modelId < 4) ? 'triangle' : 'sawtooth';
                osc.frequency.setValueAtTime(f, now + i * 0.08);

                gain.gain.setValueAtTime(0.0001, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.9);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(now + i * 0.08);
                osc.stop(now + i * 0.08 + 1.0);
            });
        } catch (e) {
            console.log('Audition sound not supported', e);
        }
    }

    // =========================================================================
    // Trigger Hook
    // =========================================================================
    pedal.find('.t3k-cloud-trigger-btn').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openTone3000Overlay();
    });

    // Also open on double clicking the pedal body
    pedal.on('dblclick', function (e) {
        if (!$(e.target).closest('.custom-knob-dial, .mod-footswitch').length) {
            openTone3000Overlay();
        }
    });

    // Init
    initKnobs();
    updateLcdDisplay(0);

    // Initial value updates from MOD host
    if (event.ports && event.ports.model !== undefined) {
        var mId = Math.round(event.ports.model);
        currentModelId = mId;
        updateLcdDisplay(mId);
    }
}
