const base = [
    { user: 'admin', pass: '1234', rol: 'Administrador', url: 'admin.html' },
    { user: 'usuario', pass: '1234', rol: 'Usuario', url: 'usuario.html' },
    { user: 'trabajador', pass: '1234', rol: 'Trabajador', url: 'trabajador.html' }
];

const API_BASE = 'https://oss.exercisedb.dev/api/v1';
const STORAGE_CATALOGO = 'nayux_catalogo_v2';
const STORAGE_RUTINA = 'nayux_rutina_v2';
const CDN_EX = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

const DICCIONARIO_ES = {
    'chest': 'Pecho',
    'back': 'Espalda',
    'upper legs': 'Piernas',
    'lower legs': 'Pantorrillas',
    'shoulders': 'Hombros',
    'upper arms': 'Brazos',
    'lower arms': 'Antebrazos',
    'waist': 'Abdomen / Core',
    'cardio': 'Cardio',
    'neck': 'Cuello',
    'pectorals': 'Pectorales',
    'lats': 'Dorsales',
    'quads': 'Cuádriceps',
    'hamstrings': 'Isquiotibiales',
    'glutes': 'Glúteos',
    'delts': 'Deltoides',
    'biceps': 'Bíceps',
    'triceps': 'Tríceps',
    'abs': 'Abdominales',
    'calves': 'Gemelos',
    'barbell': 'Barra olímpica',
    'dumbbell': 'Mancuernas',
    'cable': 'Polea / Cable',
    'body weight': 'Peso corporal',
    'leverage machine': 'Máquina guiada',
    'smith machine': 'Máquina Smith',
    'kettlebell': 'Pesa rusa',
    'band': 'Banda elástica'
};

function traducirTermino(texto) {
    if (!texto) return 'General';
    const clave = texto.toLowerCase().trim();
    return DICCIONARIO_ES[clave] || (texto.charAt(0).toUpperCase() + texto.slice(1));
}

function obtenerImagenRespaldoSVG(zona) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200' viewBox='0 0 320 200'>
        <defs>
            <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stop-color='#27272a'/>
                <stop offset='100%' stop-color='#121215'/>
            </linearGradient>
        </defs>
        <rect width='320' height='200' fill='url(#g)'/>
        <circle cx='160' cy='82' r='32' fill='none' stroke='#71717a' stroke-width='2.5'/>
        <path d='M132 82 h56 M142 70 v24 M178 70 v24' stroke='#e4e4e7' stroke-width='3.5' stroke-linecap='round'/>
        <text x='50%' y='145' dominant-baseline='middle' text-anchor='middle' fill='#f4f4f5' font-family='Segoe UI,Arial,sans-serif' font-size='13' font-weight='600' letter-spacing='1.5'>${(zona || 'ENTRENAMIENTO').toUpperCase()}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// ==========================================
// 1. AUTENTICACIÓN Y REDIRECCIÓN POR ROL
// ==========================================
function autocompletar(u, p) {
    const uEl = document.getElementById('inputUser');
    const pEl = document.getElementById('inputPass');
    if (uEl) uEl.value = u;
    if (pEl) pEl.value = p;
}

function iniciarSesion(e) {
    if (e) e.preventDefault();
    const uEl = document.getElementById('inputUser');
    const pEl = document.getElementById('inputPass');
    const errorMsg = document.getElementById('errorMsg');

    const inputUser = (uEl ? uEl.value : '').trim().toLowerCase();
    const inputPass = (pEl ? pEl.value : '').trim();

    const usuarioAutenticado = base.find(
        u => u.user.toLowerCase() === inputUser && u.pass === inputPass
    );

    if (usuarioAutenticado) {
        if (errorMsg) errorMsg.classList.add('d-none');
        sessionStorage.setItem('sesionActiva', JSON.stringify(usuarioAutenticado));
        registrarAcceso(usuarioAutenticado.rol);
        window.location.href = usuarioAutenticado.url;
    } else {
        if (errorMsg) errorMsg.classList.remove('d-none');
    }
}

function saltarLoginSiAutenticado() {
    const raw = sessionStorage.getItem('sesionActiva');
    if (!raw) return;
    try {
        const sesion = JSON.parse(raw);
        if (sesion && sesion.url) {
            window.location.href = sesion.url;
        }
    } catch (_) {
        sessionStorage.removeItem('sesionActiva');
    }
}

function verificarSesion(rolRequerido) {
    const raw = sessionStorage.getItem('sesionActiva');
    if (!raw) {
        window.location.href = 'index.html';
        return;
    }
    try {
        const sesion = JSON.parse(raw);
        if (!sesion || (rolRequerido && sesion.rol !== rolRequerido)) {
            window.location.href = 'index.html';
            return;
        }
        const lblUsuario = document.getElementById('nombreUsuarioNav');
        if (lblUsuario) lblUsuario.textContent = `${sesion.user} (${sesion.rol})`;
    } catch (_) {
        window.location.href = 'index.html';
    }
}

function cerrarSesion() {
    if (confirm('¿Deseas cerrar tu sesión en NAY-UX?')) {
        sessionStorage.removeItem('sesionActiva');
        window.location.href = 'index.html';
    }
}

function registrarAcceso(rol) {
    const historial = JSON.parse(sessionStorage.getItem('historialAccesos')) || [];
    const fechaHora = new Date().toLocaleString('es-MX');
    historial.unshift(`[${rol}] Acceso #${historial.length + 1} — ${fechaHora}`);
    sessionStorage.setItem('historialAccesos', JSON.stringify(historial));
}

// ==========================================
// 2. CATÁLOGO VISUAL CON IMÁGENES REALES
// ==========================================
const CATALOGO_RESPALDO_NAYUX = [
    // PECHO (chest)
    {
        id: 'nay-chest-01',
        nombre: 'Press de banca plano con barra',
        zona: 'Pecho',
        musculo: 'Pectorales',
        equipo: 'Barra olímpica',
        gif: `${CDN_EX}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`,
        instrucciones: [
            'Acuéstate boca arriba en una banca plana con los pies firmes en el suelo.',
            'Sujeta la barra con un agarre un poco más ancho que el ancho de tus hombros.',
            'Baja la barra de forma controlada hacia la parte media del pecho y empuja hasta extender los codos.'
        ]
    },
    {
        id: 'nay-chest-02',
        nombre: 'Press inclinado con mancuernas',
        zona: 'Pecho',
        musculo: 'Pectorales',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Incline_Dumbbell_Press/0.jpg`,
        instrucciones: [
            'Ajusta la banca en una inclinación de 30 a 45 grados.',
            'Sostén una mancuerna en cada mano a la altura del pecho superior.',
            'Empuja hacia arriba contrayendo el pectoral superior y desciende lentamente.'
        ]
    },
    {
        id: 'nay-chest-03',
        nombre: 'Aperturas en polea o contractora',
        zona: 'Pecho',
        musculo: 'Pectorales',
        equipo: 'Polea / Cable',
        gif: `${CDN_EX}/Cable_Crossover/0.jpg`,
        instrucciones: [
            'Coloca las poleas a la altura de los hombros y da un paso adelante con el torso ligeramente inclinado.',
            'Mantén una ligera flexión en los codos y junta las manos frente al pecho.',
            'Regresa con control sintiendo el estiramiento en el pectoral.'
        ]
    },
    {
        id: 'nay-chest-04',
        nombre: 'Fondos en paralelas para pecho',
        zona: 'Pecho',
        musculo: 'Pectorales',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Dips_-_Chest_Version/0.jpg`,
        instrucciones: [
            'Sujétate de las barras paralelas e inclina ligeramente el torso hacia adelante.',
            'Desciende flexionando los codos hasta sentir un estiramiento cómodo en el pecho.',
            'Impúlsate hacia arriba sin bloquear bruscamente los codos.'
        ]
    },
    {
        id: 'nay-chest-05',
        nombre: 'Press de pecho en máquina guiada',
        zona: 'Pecho',
        musculo: 'Pectorales',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Machine_Bench_Press/0.jpg`,
        instrucciones: [
            'Ajusta la altura del asiento para que las manijas queden a la altura del pecho.',
            'Empuja las manijas hacia adelante exhalando y contrayendo el pecho.',
            'Controla el regreso sin que las pesas golpeen.'
        ]
    },
    {
        id: 'nay-chest-06',
        nombre: 'Flexiones de pecho explosivas',
        zona: 'Pecho',
        musculo: 'Pectorales',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Pushups/0.jpg`,
        instrucciones: [
            'Colócate en posición de plancha con las manos ligeramente más abiertas que los hombros.',
            'Baja el cuerpo manteniendo el core firme y el abdomen contraído.',
            'Empuja con fuerza para subir manteniendo la alineación corporal.'
        ]
    },

    // ESPALDA (back)
    {
        id: 'nay-back-01',
        nombre: 'Jalón al pecho en polea alta',
        zona: 'Espalda',
        musculo: 'Dorsales',
        equipo: 'Polea / Cable',
        gif: `${CDN_EX}/Wide-Grip_Lat_Pulldown/0.jpg`,
        instrucciones: [
            'Siéntate y asegura los muslos bajo los rodillos de la máquina.',
            'Toma la barra con agarre amplio y tira hacia la parte superior del pecho.',
            'Lleva los hombros hacia atrás y abajo, evitando balancear el torso.'
        ]
    },
    {
        id: 'nay-back-02',
        nombre: 'Remo con barra inclinada',
        zona: 'Espalda',
        musculo: 'Dorsales',
        equipo: 'Barra olímpica',
        gif: `${CDN_EX}/Bent_Over_Barbell_Row/0.jpg`,
        instrucciones: [
            'Inclina el torso hacia adelante manteniendo la espalda recta y neutra.',
            'Tira de la barra hacia el abdomen bajo juntando las escápulas.',
            'Baja la barra de forma controlada manteniendo la tensión muscular.'
        ]
    },
    {
        id: 'nay-back-03',
        nombre: 'Remo con mancuerna a una mano',
        zona: 'Espalda',
        musculo: 'Dorsales',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/One-Arm_Dumbbell_Row/0.jpg`,
        instrucciones: [
            'Apoya una rodilla y una mano en la banca manteniendo el tronco estable.',
            'Lleva la mancuerna hacia la cadera con el codo pegado al costado.',
            'Desciende lentamente hasta estirar por completo la espalda.'
        ]
    },
    {
        id: 'nay-back-04',
        nombre: 'Remo en polea baja sentado',
        zona: 'Espalda',
        musculo: 'Dorsales',
        equipo: 'Polea / Cable',
        gif: `${CDN_EX}/Seated_Cable_Rows/0.jpg`,
        instrucciones: [
            'Apoya los pies en la plataforma con una ligera flexión en las rodillas.',
            'Tira del maneral hacia el abdomen manteniendo el pecho erguido.',
            'Extiende los brazos con control sin encorvar la zona lumbar.'
        ]
    },
    {
        id: 'nay-back-05',
        nombre: 'Dominadas pronas en barra fija',
        zona: 'Espalda',
        musculo: 'Dorsales',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Pullups/0.jpg`,
        instrucciones: [
            'Cuelga de la barra con las manos separadas un poco más que el ancho de hombros.',
            'Eleva el cuerpo hasta que la barbilla supere la barra usando la espalda.',
            'Baja de forma controlada hasta extender los brazos.'
        ]
    },
    {
        id: 'nay-back-06',
        nombre: 'Pullover en polea con cuerda',
        zona: 'Espalda',
        musculo: 'Dorsales',
        equipo: 'Polea / Cable',
        gif: `${CDN_EX}/Straight-Arm_Pulldown/0.jpg`,
        instrucciones: [
            'Sujeta la cuerda de polea alta con los brazos casi extendidos.',
            'Lleva la cuerda hacia los muslos activando los dorsales.',
            'Regresa lentamente manteniendo el core firme.'
        ]
    },

    // PIERNAS (upper legs)
    {
        id: 'nay-legs-01',
        nombre: 'Sentadilla libre con barra',
        zona: 'Piernas',
        musculo: 'Cuádriceps, Glúteos',
        equipo: 'Barra olímpica',
        gif: `${CDN_EX}/Barbell_Squat/0.jpg`,
        instrucciones: [
            'Coloca la barra sobre el trapecio superior y separa los pies al ancho de hombros.',
            'Desciende flexionando caderas y rodillas manteniendo el torso firme.',
            'Empuja con toda la planta del pie para volver a la posición inicial.'
        ]
    },
    {
        id: 'nay-legs-02',
        nombre: 'Prensa de piernas inclinada',
        zona: 'Piernas',
        musculo: 'Cuádriceps, Glúteos',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Leg_Press/0.jpg`,
        instrucciones: [
            'Coloca los pies al ancho de los hombros en el centro de la plataforma.',
            'Libera el seguro y baja el peso de forma controlada sin despegar la cadera.',
            'Empuja sin bloquear las rodillas por completo al extender.'
        ]
    },
    {
        id: 'nay-legs-03',
        nombre: 'Peso muerto rumano con mancuernas',
        zona: 'Piernas',
        musculo: 'Isquiotibiales, Glúteos',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Romanian_Deadlift_with_Dumbbells/0.jpg`,
        instrucciones: [
            'Sostén las mancuernas frente a los muslos con una leve flexión de rodillas.',
            'Lleva la cadera hacia atrás manteniendo la espalda recta hasta sentir tensión femoral.',
            'Contrae glúteos e isquiotibiales para regresar a la vertical.'
        ]
    },
    {
        id: 'nay-legs-04',
        nombre: 'Extensiones de cuádriceps en máquina',
        zona: 'Piernas',
        musculo: 'Cuádriceps',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Leg_Extensions/0.jpg`,
        instrucciones: [
            'Ajusta el respaldo y coloca el rodillo justo por encima de los empeines.',
            'Extiende las piernas hasta contraer firmemente los cuádriceps.',
            'Baja el peso de manera lenta y controlada.'
        ]
    },
    {
        id: 'nay-legs-05',
        nombre: 'Curl femoral acostado en máquina',
        zona: 'Piernas',
        musculo: 'Isquiotibiales',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Lying_Leg_Curls/0.jpg`,
        instrucciones: [
            'Acuéstate boca abajo alineando las rodillas con el eje de la máquina.',
            'Flexiona las rodillas llevando los talones hacia los glúteos.',
            'Regresa lentamente sin perder la tensión.'
        ]
    },
    {
        id: 'nay-legs-06',
        nombre: 'Zancadas alternas con mancuernas',
        zona: 'Piernas',
        musculo: 'Cuádriceps, Glúteos',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Dumbbell_Lunges/0.jpg`,
        instrucciones: [
            'Da un paso amplio hacia adelante y baja hasta formar ángulos cercanos a 90 grados.',
            'Empuja con la pierna delantera para regresar al inicio.',
            'Alterna de pierna manteniendo el equilibrio y el torso recto.'
        ]
    },

    // PANTORRILLAS / GEMELOS (lower legs)
    {
        id: 'nay-calves-01',
        nombre: 'Elevación de talones de pie en máquina',
        zona: 'Pantorrillas',
        musculo: 'Gemelos',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Standing_Calf_Raises/0.jpg`,
        instrucciones: [
            'Apoya el metatarso de los pies en el borde de la plataforma con los hombros bajo las almohadillas.',
            'Baja los talones para estirar los gemelos con control.',
            'Sube a la punta de los pies y sostén un segundo arriba.'
        ]
    },
    {
        id: 'nay-calves-02',
        nombre: 'Elevación de talones sentado en máquina',
        zona: 'Pantorrillas',
        musculo: 'Gemelos',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Seated_Calf_Raise/0.jpg`,
        instrucciones: [
            'Coloca las almohadillas sobre la parte baja de los muslos y los pies en el soporte.',
            'Eleva los talones lo más alto posible exhalando.',
            'Desciende suavemente hasta completar el recorrido.'
        ]
    },
    {
        id: 'nay-calves-03',
        nombre: 'Elevación de gemelos en prensa',
        zona: 'Pantorrillas',
        musculo: 'Gemelos',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Calf_Press_On_The_Leg_Press_Machine/0.jpg`,
        instrucciones: [
            'Coloca únicamente la punta de los pies en la parte baja de la plataforma.',
            'Mantén las rodillas ligeramente semiflexionadas y empuja con las pantorrillas.',
            'Baja con control sin rebotar en el punto inferior.'
        ]
    },
    {
        id: 'nay-calves-04',
        nombre: 'Elevación de talones a una pierna con mancuerna',
        zona: 'Pantorrillas',
        musculo: 'Gemelos',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Standing_Dumbbell_Calf_Raise/0.jpg`,
        instrucciones: [
            'Sostén una mancuerna del lado de la pierna que trabaja y apóyate para mantener el equilibrio.',
            'Sube sobre la punta del pie contrayendo la pantorrilla.',
            'Baja lentamente hasta estirar.'
        ]
    },

    // HOMBROS (shoulders)
    {
        id: 'nay-shoulders-01',
        nombre: 'Press militar con barra de pie',
        zona: 'Hombros',
        musculo: 'Deltoides',
        equipo: 'Barra olímpica',
        gif: `${CDN_EX}/Standing_Military_Press/0.jpg`,
        instrucciones: [
            'Coloca la barra a la altura de las clavículas con el abdomen y glúteos firmes.',
            'Empuja la barra por encima de la cabeza sin arquear en exceso la espalda baja.',
            'Baja de forma controlada hasta la posición inicial.'
        ]
    },
    {
        id: 'nay-shoulders-02',
        nombre: 'Elevaciones laterales con mancuernas',
        zona: 'Hombros',
        musculo: 'Deltoides',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Side_Lateral_Raise/0.jpg`,
        instrucciones: [
            'Sostén una mancuerna en cada mano a los costados con los codos ligeramente flexionados.',
            'Eleva los brazos hacia los lados hasta la altura de los hombros.',
            'Baja lentamente manteniendo la tensión en el deltoides lateral.'
        ]
    },
    {
        id: 'nay-shoulders-03',
        nombre: 'Press de hombros con mancuernas sentado',
        zona: 'Hombros',
        musculo: 'Deltoides',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Seated_Dumbbell_Press/0.jpg`,
        instrucciones: [
            'Siéntate con el respaldo recto y las mancuernas a la altura de las orejas.',
            'Eleva las mancuernas sin chocarlas bruscamente arriba.',
            'Desciende con control hasta el punto de partida.'
        ]
    },
    {
        id: 'nay-shoulders-04',
        nombre: 'Pájaros o elevaciones posteriores en máquina',
        zona: 'Hombros',
        musculo: 'Deltoides',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Reverse_Machine_Flyes/0.jpg`,
        instrucciones: [
            'Siéntate de frente al respaldo de la máquina y toma las manijas.',
            'Abre los brazos hacia atrás enfocándote en la parte posterior del hombro.',
            'Regresa lentamente sin perder la postura.'
        ]
    },
    {
        id: 'nay-shoulders-05',
        nombre: 'Elevaciones frontales con mancuernas',
        zona: 'Hombros',
        musculo: 'Deltoides',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Front_Dumbbell_Raise/0.jpg`,
        instrucciones: [
            'Mantén el torso firme y los brazos ligeramente flexionados.',
            'Eleva al frente hasta la altura de los hombros.',
            'Baja de forma controlada.'
        ]
    },

    // BRAZOS (upper arms)
    {
        id: 'nay-arms-01',
        nombre: 'Curl de bíceps con barra recta',
        zona: 'Brazos',
        musculo: 'Bíceps',
        equipo: 'Barra olímpica',
        gif: `${CDN_EX}/Barbell_Curl/0.jpg`,
        instrucciones: [
            'Mantén los codos pegados a los costados y la espalda recta.',
            'Sube la barra flexionando los codos y contrayendo los bíceps.',
            'Baja lentamente hasta extender casi por completo los brazos.'
        ]
    },
    {
        id: 'nay-arms-02',
        nombre: 'Curl martillo con mancuernas',
        zona: 'Brazos',
        musculo: 'Bíceps',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Hammer_Curls/0.jpg`,
        instrucciones: [
            'Sostén las mancuernas con agarre neutro (palmas enfrentadas).',
            'Eleva las mancuernas sin girar las muñecas ni balancear el cuerpo.',
            'Desciende con control.'
        ]
    },
    {
        id: 'nay-arms-03',
        nombre: 'Extensión de tríceps en polea alta',
        zona: 'Brazos',
        musculo: 'Tríceps',
        equipo: 'Polea / Cable',
        gif: `${CDN_EX}/Triceps_Pushdown/0.jpg`,
        instrucciones: [
            'Mantén los codos fijos a los costados del torso.',
            'Extiende los antebrazos hacia abajo apretando los tríceps.',
            'Sube de forma controlada hasta que los antebrazos lleguen cerca de la paralela.'
        ]
    },
    {
        id: 'nay-arms-04',
        nombre: 'Press francés o copa con mancuerna',
        zona: 'Brazos',
        musculo: 'Tríceps',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Standing_Dumbbell_Triceps_Extension/0.jpg`,
        instrucciones: [
            'Sostén una mancuerna con ambas manos por encima de la cabeza.',
            'Baja la mancuerna por detrás de la cabeza flexionando los codos.',
            'Extiende hacia arriba sin separar los codos hacia afuera.'
        ]
    },
    {
        id: 'nay-arms-05',
        nombre: 'Curl predicador en banco Scott',
        zona: 'Brazos',
        musculo: 'Bíceps',
        equipo: 'Barra olímpica',
        gif: `${CDN_EX}/Preacher_Curl/0.jpg`,
        instrucciones: [
            'Apoya la parte posterior de los brazos sobre el cojín inclinado.',
            'Sube el peso enfocándote en el pico del bíceps.',
            'Baja lentamente sin estirar de golpe.'
        ]
    },

    // ANTEBRAZOS (lower arms)
    {
        id: 'nay-forearms-01',
        nombre: 'Curl de muñeca con barra sentado',
        zona: 'Antebrazos',
        musculo: 'Antebrazos',
        equipo: 'Barra olímpica',
        gif: `${CDN_EX}/Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/0.jpg`,
        instrucciones: [
            'Apoya los antebrazos sobre los muslos con las muñecas libres más allá de las rodillas.',
            'Deja que la barra baje hasta las yemas de los dedos y flexiona la muñeca hacia arriba.',
            'Realiza repeticiones controladas.'
        ]
    },
    {
        id: 'nay-forearms-02',
        nombre: 'Curl inverso de muñeca con mancuernas',
        zona: 'Antebrazos',
        musculo: 'Antebrazos',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg`,
        instrucciones: [
            'Sujeta las mancuernas con las palmas hacia abajo sobre una superficie firme.',
            'Eleva el dorso de las manos hacia ti activando los extensores del antebrazo.',
            'Baja lentamente.'
        ]
    },
    {
        id: 'nay-forearms-03',
        nombre: 'Curl inverso de bíceps con barra',
        zona: 'Antebrazos',
        musculo: 'Antebrazos, Bíceps',
        equipo: 'Barra olímpica',
        gif: `${CDN_EX}/Reverse_Barbell_Curl/0.jpg`,
        instrucciones: [
            'Toma la barra con agarre prono (palmas hacia abajo) al ancho de los hombros.',
            'Eleva la barra manteniendo los codos estables.',
            'Desciende de forma controlada.'
        ]
    },
    {
        id: 'nay-forearms-04',
        nombre: 'Paseo del granjero con mancuernas pesadas',
        zona: 'Antebrazos',
        musculo: 'Antebrazos',
        equipo: 'Mancuernas',
        gif: `${CDN_EX}/Farmers_Walk/0.jpg`,
        instrucciones: [
            'Toma dos mancuernas pesadas a los costados con la postura erguida.',
            'Camina a paso firme manteniendo los hombros atrás y el agarre fuerte.',
            'Apoya el peso con cuidado al terminar el recorrido.'
        ]
    },

    // ABDOMEN / CORE (waist)
    {
        id: 'nay-abs-01',
        nombre: 'Crunch abdominal en colchoneta',
        zona: 'Abdomen / Core',
        musculo: 'Abdominales',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Crunches/0.jpg`,
        instrucciones: [
            'Acuéstate boca arriba con las rodillas flexionadas y las manos detrás de la cabeza sin jalar el cuello.',
            'Eleva los hombros del suelo contrayendo el abdomen.',
            'Baja lentamente sin perder la tensión en el core.'
        ]
    },
    {
        id: 'nay-abs-02',
        nombre: 'Plancha abdominal isométrica',
        zona: 'Abdomen / Core',
        musculo: 'Abdominales',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Plank/0.jpg`,
        instrucciones: [
            'Apóyate sobre los antebrazos y las puntas de los pies manteniendo el cuerpo en línea recta.',
            'Aprieta el abdomen y los glúteos evitando que la cadera caiga o se eleve.',
            'Respira de forma constante durante el tiempo indicado.'
        ]
    },
    {
        id: 'nay-abs-03',
        nombre: 'Elevación de piernas colgado o en banca',
        zona: 'Abdomen / Core',
        musculo: 'Abdominales',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Hanging_Leg_Raise/0.jpg`,
        instrucciones: [
            'Mantén el torso estable y eleva las piernas juntas de forma controlada.',
            'Lleva las rodillas o piernas hacia el frente sin balancearte con impulso.',
            'Baja lentamente hasta la posición inicial.'
        ]
    },
    {
        id: 'nay-abs-04',
        nombre: 'Crunch en polea alta',
        zona: 'Abdomen / Core',
        musculo: 'Abdominales',
        equipo: 'Polea / Cable',
        gif: `${CDN_EX}/Cable_Crunch/0.jpg`,
        instrucciones: [
            'Arrodíllate frente a una polea alta y toma la cuerda a la altura de la frente.',
            'Flexiona el torso hacia abajo contrayendo los abdominales.',
            'Regresa con control sin tirar con los brazos.'
        ]
    },
    {
        id: 'nay-abs-05',
        nombre: 'Giros rusos con disco o balón',
        zona: 'Abdomen / Core',
        musculo: 'Abdominales',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Russian_Twist/0.jpg`,
        instrucciones: [
            'Siéntate con el torso ligeramente inclinado hacia atrás y los pies elevados o apoyados.',
            'Gira el tronco de lado a lado activando los oblicuos.',
            'Mantén el movimiento controlado en cada giro.'
        ]
    },

    // CARDIO (cardio)
    {
        id: 'nay-cardio-01',
        nombre: 'Salto de cuerda de alta intensidad',
        zona: 'Cardio',
        musculo: 'Cardio',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Rope_Jumping/0.jpg`,
        instrucciones: [
            'Mantén los codos cerca del torso y gira la cuerda usando las muñecas.',
            'Salta ligeramente sobre la punta de los pies amortiguando cada impacto.',
            'Conserva un ritmo constante durante todo el intervalo.'
        ]
    },
    {
        id: 'nay-cardio-02',
        nombre: 'Escaladores (Mountain Climbers)',
        zona: 'Cardio',
        musculo: 'Cardio',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Mountain_Climbers/0.jpg`,
        instrucciones: [
            'Colócate en posición de plancha alta con las manos bajo los hombros.',
            'Lleva una rodilla hacia el pecho y cámbiala rápidamente por la otra.',
            'Mantén la cadera baja y el ritmo constante.'
        ]
    },
    {
        id: 'nay-cardio-03',
        nombre: 'Carrera en caminadora inclinada',
        zona: 'Cardio',
        musculo: 'Cardio',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Running_Treadmill/0.jpg`,
        instrucciones: [
            'Ajusta la velocidad e inclinación de acuerdo con tu nivel de resistencia.',
            'Mantén la mirada al frente y el braceo natural.',
            'Reduce el ritmo gradualmente antes de detener la banda.'
        ]
    },
    {
        id: 'nay-cardio-04',
        nombre: 'Remo ergómetro de resistencia',
        zona: 'Cardio',
        musculo: 'Cardio',
        equipo: 'Máquina guiada',
        gif: `${CDN_EX}/Rowing_Stationary/0.jpg`,
        instrucciones: [
            'Impúlsate primero con las piernas manteniendo la espalda recta.',
            'Completa el tirón llevando el maneral hacia el abdomen bajo.',
            'Regresa de forma fluida extendiendo brazos y flexionando rodillas.'
        ]
    },
    {
        id: 'nay-cardio-05',
        nombre: 'Sentadilla con salto pliométrico',
        zona: 'Cardio',
        musculo: 'Cardio',
        equipo: 'Peso corporal',
        gif: `${CDN_EX}/Freehand_Jump_Squat/0.jpg`,
        instrucciones: [
            'Desciende a una sentadilla manteniendo el peso en los talones.',
            'Explota hacia arriba realizando un salto.',
            'Aterriza suavemente y encadena la siguiente repetición.'
        ]
    }
];

function obtenerEjerciciosRespaldo(zona = '') {
    if (!zona) return CATALOGO_RESPALDO_NAYUX;
    const zonaTraducida = traducirTermino(zona).toLowerCase();
    const filtrados = CATALOGO_RESPALDO_NAYUX.filter(
        ej => ej.zona.toLowerCase() === zonaTraducida || ej.zona.toLowerCase().includes(zonaTraducida)
    );
    return filtrados.length ? filtrados : CATALOGO_RESPALDO_NAYUX;
}

async function obtenerEjerciciosAPI(zona = '', limite = 60, offset = 0) {
    const respaldo = obtenerEjerciciosRespaldo(zona);
    const endpoints = zona
        ? [
            `${API_BASE}/bodyparts/${encodeURIComponent(zona)}/exercises?limit=${limite}&offset=${offset}`,
            `https://exercisedb.dev/api/v1/bodyparts/${encodeURIComponent(zona)}/exercises?limit=${limite}&offset=${offset}`
          ]
        : [
            `${API_BASE}/exercises?limit=${limite}&offset=${offset}`,
            `https://exercisedb.dev/api/v1/exercises?limit=${limite}&offset=${offset}`
          ];

    for (const url of endpoints) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3500);
            const resp = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            if (!resp.ok) continue;
            const json = await resp.json();
            const lista = json.data || json.exercises || (Array.isArray(json) ? json : []);
            if (Array.isArray(lista) && lista.length > 0) {
                const mapeados = lista.map((item, idx) => ({
                    id: item.exerciseId || item.id || `${zona || 'all'}-${idx}`,
                    nombre: item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : 'Ejercicio',
                    zona: traducirTermino(item.bodyParts?.[0] || item.bodyPart || zona),
                    musculo: (item.targetMuscles || (item.target ? [item.target] : [])).map(traducirTermino).join(', '),
                    equipo: (item.equipments || (item.equipment ? [item.equipment] : [])).map(traducirTermino).join(', '),
                    gif: item.gifUrl || respaldo[idx % respaldo.length]?.gif || '',
                    instrucciones: (item.instructions || []).map(paso =>
                        String(paso).replace(/^Step:\d+\s*/i, '')
                    )
                }));
                return [...respaldo, ...mapeados];
            }
        } catch (_) {
            // Usar catálogo visual local garantizado
        }
    }

    return respaldo;
}

function obtenerCatalogoLocal() {
    return JSON.parse(localStorage.getItem(STORAGE_CATALOGO)) || [];
}

function guardarCatalogoLocal(lista) {
    localStorage.setItem(STORAGE_CATALOGO, JSON.stringify(lista));
}

// ==========================================
// 3. PANEL DE ADMINISTRADOR (admin.html)
// ==========================================
let cacheEjerciciosAPI = [];

async function inicializarAdmin() {
    verificarSesion('Administrador');
    renderizarBitacoraAdmin();
    renderizarCatalogoAdmin();
    await buscarEnAPIAdmin();
}

function renderizarBitacoraAdmin() {
    const lista = document.getElementById('listaBitacoraAdmin');
    const statAccesos = document.getElementById('statAccesos');
    const historial = JSON.parse(sessionStorage.getItem('historialAccesos')) || [];

    if (statAccesos) statAccesos.textContent = historial.length || 1;
    if (!lista) return;

    lista.innerHTML = historial.length
        ? historial.map(h => `<li class="list-group-item bg-transparent text-secondary border-secondary border-opacity-25">${h}</li>`).join('')
        : `<li class="list-group-item bg-transparent text-muted border-secondary border-opacity-25">Sin accesos previos.</li>`;
}

async function buscarEnAPIAdmin() {
    const contenedor = document.getElementById('contenedorAPI');
    if (!contenedor) return;

    const zona = document.getElementById('filtroZonaAPI')?.value || '';
    const textoFiltro = (document.getElementById('buscadorAdminAPI')?.value || '').trim().toLowerCase();
    contenedor.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-light"></div><p class="mt-2 text-secondary">Cargando catálogo de ejercicios...</p></div>`;

    cacheEjerciciosAPI = await obtenerEjerciciosAPI(zona, 60, 0);
    const listaFiltrada = textoFiltro
        ? cacheEjerciciosAPI.filter(ej =>
            ej.nombre.toLowerCase().includes(textoFiltro) ||
            ej.zona.toLowerCase().includes(textoFiltro) ||
            ej.musculo.toLowerCase().includes(textoFiltro) ||
            ej.equipo.toLowerCase().includes(textoFiltro)
          )
        : cacheEjerciciosAPI;
    contenedor.innerHTML = '';

    if (listaFiltrada.length === 0) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-dark border-secondary text-secondary">No se encontraron ejercicios con ese filtro.</div></div>`;
        return;
    }

    const catalogoActual = obtenerCatalogoLocal();

    listaFiltrada.forEach(ej => {
        const publicado = catalogoActual.some(item => item.id === ej.id);
        const fallbackImg = obtenerImagenRespaldoSVG(ej.zona);
        contenedor.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card h-100 api-card text-light">
                    <div class="gif-wrapper">
                        <img src="${ej.gif}" alt="${ej.nombre}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}';">
                    </div>
                    <div class="card-body">
                        <div class="d-flex gap-1 flex-wrap mb-2">
                            <span class="badge badge-zona">${ej.zona}</span>
                            <span class="badge badge-equipo">${ej.equipo}</span>
                        </div>
                        <h6 class="card-title fw-bold text-white mb-1">${ej.nombre}</h6>
                        <p class="small text-secondary mb-0">Músculo: ${ej.musculo}</p>
                    </div>
                    <div class="card-footer border-secondary border-opacity-25 bg-transparent">
                        <button class="btn btn-sm w-100 ${publicado ? 'btn-nayux-outline disabled' : 'btn-nayux-bevel'}"
                            onclick="publicarEjercicio('${ej.id}')">
                            ${publicado ? '<i class="bi bi-check2-circle me-1"></i> Publicado' : '<i class="bi bi-plus-circle me-1"></i> PUBLICAR EN NAY-UX'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

function publicarEjercicio(id) {
    const ej = cacheEjerciciosAPI.find(item => item.id === id);
    if (!ej) return;

    const catalogo = obtenerCatalogoLocal();
    if (!catalogo.some(item => item.id === id)) {
        catalogo.push(ej);
        guardarCatalogoLocal(catalogo);
        renderizarCatalogoAdmin();
        buscarEnAPIAdmin();
    }
}

function quitarEjercicioCatalogo(id) {
    let catalogo = obtenerCatalogoLocal();
    catalogo = catalogo.filter(item => item.id !== id);
    guardarCatalogoLocal(catalogo);
    renderizarCatalogoAdmin();
    buscarEnAPIAdmin();
}

function renderizarCatalogoAdmin() {
    const tabla = document.getElementById('tablaCatalogoAdmin');
    const contador = document.getElementById('contadorCatalogo');
    const statPublicados = document.getElementById('statPublicados');
    if (!tabla) return;

    const catalogo = obtenerCatalogoLocal();
    if (contador) contador.textContent = catalogo.length;
    if (statPublicados) statPublicados.textContent = catalogo.length;

    if (catalogo.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4" class="text-center text-secondary py-4">Aún no has publicado ejercicios. Selecciona algunos de la izquierda.</td></tr>`;
        return;
    }

    tabla.innerHTML = catalogo.map(ej => {
        const fallbackImg = obtenerImagenRespaldoSVG(ej.zona);
        return `
        <tr>
            <td><img src="${ej.gif}" width="44" height="44" class="rounded object-fit-cover border border-secondary border-opacity-50" onerror="this.onerror=null;this.src='${fallbackImg}';"></td>
            <td class="fw-semibold text-light">${ej.nombre}</td>
            <td><span class="badge badge-zona">${ej.zona}</span></td>
            <td class="text-end">
                <button class="btn btn-sm btn-nayux-outline" onclick="quitarEjercicioCatalogo('${ej.id}')" title="Quitar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;}).join('');
}

// ==========================================
// 4. PANEL DE USUARIO / ATLETA (usuario.html)
// ==========================================
let ejerciciosUsuario = [];

async function inicializarUsuario() {
    verificarSesion('Usuario');
    const grid = document.getElementById('gridEjerciciosUsuario');
    if (!grid) return;

    grid.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-light"></div><p class="mt-2 text-secondary">Cargando biblioteca NAY-UX...</p></div>`;

    let catalogo = obtenerCatalogoLocal();
    if (catalogo.length === 0) {
        catalogo = await obtenerEjerciciosAPI('', 60, 0);
    }

    ejerciciosUsuario = catalogo;
    renderizarEjerciciosUsuario(ejerciciosUsuario);
    renderizarMiRutina();
}

function filtrarEjerciciosUsuario() {
    const q = document.getElementById('buscadorUsuario').value.toLowerCase();
    const filtrados = ejerciciosUsuario.filter(ej =>
        ej.nombre.toLowerCase().includes(q) ||
        ej.zona.toLowerCase().includes(q) ||
        ej.musculo.toLowerCase().includes(q) ||
        ej.equipo.toLowerCase().includes(q)
    );
    renderizarEjerciciosUsuario(filtrados);
}

function renderizarEjerciciosUsuario(lista) {
    const grid = document.getElementById('gridEjerciciosUsuario');
    if (lista.length === 0) {
        grid.innerHTML = `<div class="col-12"><div class="alert alert-dark border-secondary text-secondary">No se encontraron ejercicios con ese criterio.</div></div>`;
        return;
    }

    grid.innerHTML = lista.map(ej => {
        const fallbackImg = obtenerImagenRespaldoSVG(ej.zona);
        return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 exercise-card text-light">
                <div class="gif-box">
                    <img src="${ej.gif}" alt="${ej.nombre}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}';">
                </div>
                <div class="card-body">
                    <div class="d-flex gap-1 flex-wrap mb-2">
                        <span class="badge badge-zona">${ej.zona}</span>
                        <span class="badge badge-equipo">${ej.equipo}</span>
                    </div>
                    <h6 class="card-title fw-bold text-white">${ej.nombre}</h6>
                    <p class="small text-secondary mb-0">Enfoque: ${ej.musculo}</p>
                </div>
                <div class="card-footer border-secondary border-opacity-25 bg-transparent d-flex gap-2">
                    <button class="btn btn-nayux-outline btn-sm flex-grow-1" onclick="verDetalleEjercicio('${ej.id}')">Ver Técnica</button>
                    <button class="btn btn-nayux-bevel btn-sm" onclick="agregarRutina('${ej.id}')">+ RUTINA</button>
                </div>
            </div>
        </div>
    `;}).join('');
}

function verDetalleEjercicio(id) {
    const ej = ejerciciosUsuario.find(item => item.id === id);
    if (!ej) return;

    const fallbackImg = obtenerImagenRespaldoSVG(ej.zona);
    document.getElementById('modalTitulo').textContent = ej.nombre;
    const mImg = document.getElementById('modalImg');
    mImg.onerror = function() { this.onerror = null; this.src = fallbackImg; };
    mImg.src = ej.gif;
    document.getElementById('modalCategoria').textContent = ej.zona;
    document.getElementById('modalMusculo').textContent = ej.musculo;
    document.getElementById('modalEquipo').textContent = ej.equipo;

    const listaPasos = document.getElementById('modalInstrucciones');
    listaPasos.innerHTML = (ej.instrucciones.length ? ej.instrucciones : ['Realiza el movimiento de forma controlada.'])
        .map(paso => `<li class="list-group-item bg-dark text-light border-secondary border-opacity-25">${paso}</li>`)
        .join('');

    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    modal.show();
}

function agregarRutina(id) {
    const ej = ejerciciosUsuario.find(item => item.id === id);
    if (!ej) return;

    const rutina = JSON.parse(localStorage.getItem(STORAGE_RUTINA)) || [];
    if (!rutina.some(item => item.id === id)) {
        rutina.push({ ...ej, series: '4 x 12' });
        localStorage.setItem(STORAGE_RUTINA, JSON.stringify(rutina));
        renderizarMiRutina();
    }
}

function eliminarDeRutina(id) {
    let rutina = JSON.parse(localStorage.getItem(STORAGE_RUTINA)) || [];
    rutina = rutina.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_RUTINA, JSON.stringify(rutina));
    renderizarMiRutina();
}

function vaciarRutina() {
    localStorage.removeItem(STORAGE_RUTINA);
    renderizarMiRutina();
}

function renderizarMiRutina() {
    const lista = document.getElementById('listaMiRutina');
    const contador = document.getElementById('contadorRutina');
    if (!lista) return;

    const rutina = JSON.parse(localStorage.getItem(STORAGE_RUTINA)) || [];
    if (contador) contador.textContent = rutina.length;

    if (rutina.length === 0) {
        lista.innerHTML = `<li class="list-group-item bg-transparent text-secondary border-secondary border-opacity-25 small">Aún no has agregado ejercicios a tu sesión de hoy.</li>`;
        return;
    }

    lista.innerHTML = rutina.map(ej => {
        const fallbackImg = obtenerImagenRespaldoSVG(ej.zona);
        return `
        <li class="list-group-item bg-transparent text-light border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
                <img src="${ej.gif}" width="40" height="40" class="rounded object-fit-cover border border-secondary border-opacity-50" onerror="this.onerror=null;this.src='${fallbackImg}';">
                <div>
                    <div class="fw-semibold small text-white">${ej.nombre}</div>
                    <span class="badge badge-equipo">${ej.series}</span>
                </div>
            </div>
            <button class="btn btn-sm btn-nayux-outline" onclick="eliminarDeRutina('${ej.id}')">✕</button>
        </li>
    `;}).join('');
}
