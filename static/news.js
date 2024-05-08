function submitCategory(category) {
    document.getElementById('categoryInput').value = category;
    document.forms[0].submit();
}

function highlightButton(buttonId) {
    // Usuwanie klasy 'selected' ze wszystkich przycisków
    var buttons = document.getElementsByClassName('button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('selected');
    }

    // Dodanie klasy 'selected' do klikniętego przycisku
    var selectedButton = document.getElementById(buttonId);
    selectedButton.classList.add('selected');
}

window.onload = function() {
    var path = window.location.pathname;
    var activeIconId;

    switch (path) {
        case '/index':
            activeIconId = 'icon-home';
            break;
        case '/newss':
            activeIconId = 'icon-newss';
            break;
        case '/wallet':
            activeIconId = 'icon-wallet';
            break;
        case '/settings':
            activeIconId = 'icon-settings';
            break;
        default:
            return; // Brak działania dla innych ścieżek
    }

    var activeIcon = document.getElementById(activeIconId);
    if (activeIcon) {
        activeIcon.classList.add('active-icon');
    }
}