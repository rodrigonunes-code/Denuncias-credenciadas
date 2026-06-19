import {
  initializeCloud,
  observeAuth,
  login,
  logout,
  resetPassword,
  currentUser,
  getIdToken,
  listDocuments,
  getDocument,
  createDocument,
  saveDocument,
  removeDocument,
  seedSchoolDocuments,
  createComplaint,
  removeComplaint
} from "./firebase-client.js";

const OFFICIAL_SCHOOLS = [
  "EEI ALGODÃO DOCE (PRIVADA)",
  "EEI ANJINHOS DA GUARDA ESTÂNCIA (PRIVADA)",
  "EEI ANJINHOS DA GUARDA ESTÂNCIA, RUA TRAMANDAÍ (PRIVADA)",
  "EEI ANJINHOS DA GUARDA IGARA (PRIVADA)",
  "EEI ANJOS E MARMANJOS - FILIAL (PRIVADA)",
  "EEI AQUARELA (PRIVADA)",
  "EEI AQUARELA KIDS (PRIVADA)",
  "EEI ARCA DE NOÉ (PRIVADA)",
  "EEI ASSABENI (SEM FINS LUCRATIVOS)",
  "EEI ASSABENI FILIAL (SEM FINS LUCRATIVOS)",
  "EEI BABY RIO BRANCO (PRIVADA)",
  "EEI BAMBINO CAMPONES (PRIVADA)",
  "EEI BRINCANDO COM AS CORES (PRIVADA)",
  "EEI BRINCANDO E APRENDENDO (PRIVADA)",
  "EEI CASTELINHO DA ALEGRIA (PRIVADA)",
  "EEI CASTELO AMARELO (PRIVADA)",
  "EEI CASTELO ENCANTADO (PRIVADA)",
  "EEI CLUBINHO DA FÉ (PRIVADA)",
  "EEI COLORÊ (PRIVADA)",
  "EEI CORAÇÃO DA MAMÃE (PRIVADA)",
  "EEI CORAÇÃO DA TIA RÊ MATO GRANDE (PRIVADA)",
  "EEI CRECHE ANJOS E MARMANJOS RIO BRANCO (PRIVADA)",
  "EEI CRIANÇA & CIA (PRIVADA)",
  "EEI CRIANÇA ESPERANÇA (PRIVADA)",
  "EEI DENTE DE LEITE (PRIVADA)",
  "EEI DISNEYMANIA (PRIVADA)",
  "EEI DOCE CRIANÇA (PRIVADA)",
  "EEI DOCE INOCÊNCIA (PRIVADA)",
  "EEI ECOAR (PRIVADA)",
  "EEI ENCANTO DA CRIANÇA (PRIVADA)",
  "EEI ESPAÇO KIDS TIA MARIA (PRIVADA)",
  "EEI ETERNO APRENDER (PRIVADA)",
  "EEI FAZENDO ARTE (PRIVADA)",
  "EEI FELIZ IDADE (PRIVADA)",
  "EEI GAIA (PRIVADA)",
  "EEI GERAÇAO VIDA CENTRO II (SEM FINS LUCRATIVOS)",
  "EEI GERAÇÃO ESTÂNCIA (SEM FINS LUCRATIVOS)",
  "EEI GERAÇÃO OLARIA (SEM FINS LUCRATIVOS)",
  "EEI GERAÇÃO PLANALTO (SEM FINS LUCRATIVOS)",
  "EEI GERAÇÃO VIDA CENTRO (SEM FINS LUCRATIVOS)",
  "EEI GERAÇÃO VIDA GUAJUVIRAS (SEM FINS LUCRATIVOS)",
  "EEI GERAÇÃO VIDA MATHIAS (SEM FINS LUCRATIVOS)",
  "EEI HORA DO APRENDER (PRIVADA)",
  "EEI INSTITUTO ANJOS E MARMANJOS FÁTIMA (SEM FINS LUCRATIVOS)",
  "EEI JEITINHO DE ANJO (PRIVADA)",
  "EEI JEITO INOCENTE (PRIVADA)",
  "EEI MARTINHO LUTERO (SEM FINS LUCRATIVOS)",
  "EEI MEU MUNDO BABY KIDS (PRIVADA)",
  "EEI MIMI MIAU (PRIVADA)",
  "EEI MUNDO INOCENTE HARMONIA (PRIVADA)",
  "EEI MUNDO INOCENTE NITERÓI (PRIVADA)",
  "EEI PARAÍSO ENCANTADO DA CRIANÇA (PRIVADA)",
  "EEI PEQUENINOS (PRIVADA)",
  "EEI PEQUENOS CRIADORES (PRIVADA)",
  "EEI PIMPOLINHOS (HARMONIA)",
  "EEI PINGO DE GENTE SÃO JOSÉ (PRIVADA)",
  "EEI PINGUINHO DE GENTE KAISER (PRIVADA)",
  "EEI PINOQUIO (SEM FINS LUCRATIVOS)",
  "EEI PINÓQUIO - PRAÇA AMÉRICA (SEM FINS LUCRATIVOS)",
  "EEI PIQUE ESCONDE (PRIVADA)",
  "EEI POR AMOR (SEM FINS LUCRATIVOS)",
  "EEI POR AMOR FILIAL (SEM FINS LUCRATIVOS)",
  "EEI PUFF (PRIVADA)",
  "EEI RAIO DE LUZ (PRIVADA)",
  "EEI RECANTO DOS PICORRUCHOS (PRIVADA)",
  "EEI REINO ENCANTADO (PRIVADA)",
  "EEI RISKA E RABISKA CENTRO (PRIVADA)",
  "EEI RISKA E RABISKA NITEROI (PRIVADA)",
  "EEI SANTA CRUZ (SEM FINS LUCRATIVOS)",
  "EEI SEJA FELIZ (PRIVADA)",
  "EEI SEJA FELIZ 2 (PRIVADA)",
  "EEI SEMEAR (PRIVADA)",
  "EEI SÃO JOSÉ (SEM FINS LUCRATIVOS)",
  "EEI SÃO MATHEUS (SEM FINS LUCRATIVOS)",
  "EEI TAZMANIA (PRIVADA)",
  "EEI TIA NECA GUAJUVIRAS (PRIVADA)",
  "EEI TURMINHA FELIZ I (PRIVADA)",
  "EEI TURMINHA FELIZ II (PRIVADA)",
  "EEI UM SONHO DE CRIANÇA (PRIVADA)",
  "EEI URSINHOS CARINHOSOS (PRIVADA)",
  "EEI VITÓRIA (PRIVADA)",
  "EEI VÓ MARIA (SEM FINS LUCRATIVOS)",
  "EEI ÊXITO (SEM FINS LUCRATIVOS)"
];

let complaints = [];
let schools = [];
let activeComplaintId = null;
let toastTimer;
let originalReportBeforeAi = "";
let eventsBound = false;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    bindEvents();
    await initializeCloud();
    $("#authStatus").textContent = "Informe suas credenciais.";
    observeAuth(async (user) => {
      if (!user) {
        complaints = [];
        schools = [];
        $("#authScreen").classList.remove("authenticated");
        $("#signedUser").textContent = "";
        return;
      }

      $("#authScreen").classList.add("authenticated");
      $("#signedUser").textContent = user.email || "Usuário autenticado";
      $("#authStatus").textContent = "";
      await seedSchools();
      await refreshData();
      updateCurrentDate();
      await updateNextNumber();
      renderAll();
    });
  } catch (error) {
    console.error(error);
    $("#authStatus").textContent = error.message || "Não foi possível conectar ao ambiente em nuvem.";
    $("#authStatus").classList.add("error");
  }
}

async function seedSchools() {
  await seedSchoolDocuments(OFFICIAL_SCHOOLS);
}

async function refreshData() {
  [complaints, schools] = await Promise.all([
    listDocuments("complaints"),
    listDocuments("schools")
  ]);
  complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  schools.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

function bindEvents() {
  if (eventsBound) return;
  eventsBound = true;

  $("#loginForm").addEventListener("submit", handleLogin);
  $("#resetPasswordBtn").addEventListener("click", handlePasswordReset);
  $("#logoutBtn").addEventListener("click", () => logout());
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  $$("[data-view-target]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.viewTarget));
  });

  $("#menuButton").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $("#complaintForm").addEventListener("submit", submitComplaint);
  $("#schoolForm").addEventListener("submit", submitSchool);
  $("#reportText").addEventListener("input", updateCharCount);
  $("#formalizeAiBtn").addEventListener("click", formalizeReportWithAi);
  $("#restoreOriginalBtn").addEventListener("click", restoreOriginalReport);
  $("#clearFormBtn").addEventListener("click", clearComplaintForm);
  $("#searchInput").addEventListener("input", renderComplaintsList);
  $("#severityFilter").addEventListener("change", renderComplaintsList);
  $("#schoolFilter").addEventListener("change", renderComplaintsList);
  $("#exportCsvBtn").addEventListener("click", exportCsv);
  $("#backupBtn").addEventListener("click", exportBackup);
  $("#closeModalBtn").addEventListener("click", closeModal);
  $("#closeModalFooterBtn").addEventListener("click", closeModal);
  $("#printComplaintBtn").addEventListener("click", () => printComplaint(activeComplaintId));
  $("#deleteComplaintBtn").addEventListener("click", deleteActiveComplaint);
  $("#detailModal").addEventListener("click", (event) => {
    if (event.target === $("#detailModal")) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

}

async function handleLogin(event) {
  event.preventDefault();
  const button = $("#loginBtn");
  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;
  button.disabled = true;
  $("#authStatus").classList.remove("error");
  $("#authStatus").textContent = "Verificando credenciais...";
  try {
    await login(email, password);
    $("#loginForm").reset();
  } catch (error) {
    console.error(error);
    $("#authStatus").textContent = authErrorMessage(error);
    $("#authStatus").classList.add("error");
  } finally {
    button.disabled = false;
  }
}

async function handlePasswordReset() {
  const email = $("#loginEmail").value.trim();
  if (!email) {
    $("#authStatus").textContent = "Informe o e-mail para receber a redefinição de senha.";
    $("#authStatus").classList.add("error");
    return;
  }
  try {
    await resetPassword(email);
    $("#authStatus").classList.remove("error");
    $("#authStatus").textContent = "E-mail de redefinição enviado.";
  } catch (error) {
    $("#authStatus").textContent = authErrorMessage(error);
    $("#authStatus").classList.add("error");
  }
}

function switchView(viewName) {
  const titles = {
    dashboard: "Dashboard",
    nova: "Nova denúncia",
    denuncias: "Denúncias",
    escolas: "Escolas credenciadas"
  };

  $$(".view").forEach((view) => view.classList.remove("active"));
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  $(`#view-${viewName}`).classList.add("active");
  $("#pageTitle").textContent = titles[viewName];
  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (viewName === "nova") updateNextNumber();
  if (viewName === "denuncias") renderComplaintsList();
}

function updateCurrentDate() {
  $("#currentDate").textContent = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

async function getNextComplaintNumber() {
  const year = new Date().getFullYear();
  const next = Math.max(0, ...complaints.filter((item) => item.year === year).map((item) => item.sequence || 0)) + 1;
  return {
    number: `${String(next).padStart(3, "0")}/${year}`,
    sequence: next,
    year
  };
}

async function updateNextNumber() {
  const next = await getNextComplaintNumber();
  $("#nextNumber").textContent = next.number;
}

async function submitComplaint(event) {
  event.preventDefault();
  const schoolId = $("#schoolSelect").value;
  const severity = document.querySelector('input[name="severity"]:checked')?.value;
  const report = $("#reportText").value.trim();
  const school = schools.find((item) => item.id === schoolId);

  if (!school || !severity || !report) {
    showToast("Preencha os campos obrigatórios.", true);
    return;
  }

  setComplaintSaving(true);
  try {
    const number = await createComplaint({
      schoolId,
      schoolName: school.name,
      severity,
      report
    });
    await refreshData();
    clearComplaintForm(false);
    renderAll();
    showToast(`Denúncia ${number} registrada com sucesso.`);
    switchView("denuncias");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao salvar a denúncia.", true);
  } finally {
    setComplaintSaving(false);
  }
}

function setComplaintSaving(isSaving) {
  const submitButton = $("#complaintSubmitBtn");
  submitButton.disabled = isSaving;
  $("#clearFormBtn").disabled = isSaving;
  submitButton.textContent = isSaving ? "Salvando..." : "Registrar denúncia";
}

function clearComplaintForm(confirmClear = true) {
  const hasContent = $("#schoolSelect").value || $("#reportText").value;
  if (confirmClear && hasContent && !window.confirm("Deseja limpar os dados preenchidos?")) return;
  $("#complaintForm").reset();
  originalReportBeforeAi = "";
  $("#aiResultActions").classList.add("hidden");
  updateCharCount();
}

function updateCharCount() {
  $("#charCount").textContent = $("#reportText").value.length;
}

async function formalizeReportWithAi() {
  const reportField = $("#reportText");
  const button = $("#formalizeAiBtn");
  const report = reportField.value.trim();
  const schoolId = $("#schoolSelect").value;
  const school = schools.find((item) => item.id === schoolId);
  const severity = document.querySelector('input[name="severity"]:checked')?.value || "";

  if (report.length < 20) {
    showToast("Digite um relato com pelo menos 20 caracteres antes de usar a IA.", true);
    reportField.focus();
    return;
  }

  originalReportBeforeAi = reportField.value;
  button.disabled = true;
  button.innerHTML = '<span aria-hidden="true">◌</span> Formalizando...';

  try {
    const token = await getIdToken();
    const response = await fetch("/api/formalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        report,
        school: school?.name || "",
        severity,
        receivedAt: new Date().toISOString()
      })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível formalizar o relato.");
    }

    reportField.value = data.text;
    updateCharCount();
    $("#aiResultActions").classList.remove("hidden");
    showToast("Relato formalizado. Revise o texto antes de registrar.");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao acessar o serviço de IA.", true);
  } finally {
    button.disabled = false;
    button.innerHTML = '<span aria-hidden="true">✦</span> Formalizar com IA';
  }
}

function restoreOriginalReport() {
  if (!originalReportBeforeAi) return;
  $("#reportText").value = originalReportBeforeAi;
  originalReportBeforeAi = "";
  $("#aiResultActions").classList.add("hidden");
  updateCharCount();
  showToast("Texto original restaurado.");
}

async function submitSchool(event) {
  event.preventDefault();
  const input = $("#schoolNameInput");
  const name = input.value.trim();
  if (!name) return;

  if (schools.some((school) => school.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) {
    showToast("Essa escola já está cadastrada.", true);
    return;
  }

  await createDocument("schools", {
    name,
    source: "manual",
    createdAt: new Date().toISOString(),
    createdBy: currentUser()?.uid || null
  });
  input.value = "";
  await refreshData();
  renderAll();
  showToast("Escola adicionada à lista.");
}

async function removeSchool(id) {
  const school = schools.find((item) => item.id === id);
  const linked = complaints.filter((complaint) => complaint.schoolId === id).length;
  if (!school) return;

  if (linked) {
    showToast(`A escola possui ${linked} denúncia(s) vinculada(s) e não pode ser excluída.`, true);
    return;
  }

  if (!window.confirm(`Excluir "${school.name}" da lista?`)) return;
  await removeDocument("schools", id);
  await refreshData();
  renderAll();
  showToast("Escola removida.");
}

function renderAll() {
  renderSchoolOptions();
  renderSchools();
  renderDashboard();
  renderComplaintsList();
  updateNextNumber();
}

function renderSchoolOptions() {
  const complaintValue = $("#schoolSelect").value;
  const filterValue = $("#schoolFilter").value;
  const options = schools.map((school) => `<option value="${school.id}">${escapeHtml(school.name)}</option>`).join("");
  $("#schoolSelect").innerHTML = `<option value="">Selecione a escola</option>${options}`;
  $("#schoolFilter").innerHTML = `<option value="">Todas as escolas</option>${options}`;
  $("#schoolSelect").value = complaintValue;
  $("#schoolFilter").value = filterValue;
}

function renderSchools() {
  $("#schoolCount").textContent = `${schools.length} ${schools.length === 1 ? "escola" : "escolas"}`;
  $("#schoolsList").innerHTML = schools.map((school) => {
    const total = complaints.filter((complaint) => complaint.schoolId === school.id).length;
    return `
      <div class="school-row">
        <span class="school-avatar">E</span>
        <div class="school-info">
          <strong>${escapeHtml(school.name)}</strong>
          <small>${total} ${total === 1 ? "denúncia registrada" : "denúncias registradas"}</small>
        </div>
        <button class="school-delete" data-school-delete="${school.id}">Excluir</button>
      </div>
    `;
  }).join("");

  $$("[data-school-delete]").forEach((button) => {
    button.addEventListener("click", () => removeSchool(button.dataset.schoolDelete));
  });
}

function renderDashboard() {
  const now = new Date();
  const currentMonth = complaints.filter((item) => {
    const date = new Date(item.createdAt);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const graves = complaints.filter((item) => item.severity === "Grave").length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recent = complaints.filter((item) => new Date(item.createdAt) >= thirtyDaysAgo).length;
  const schoolsWithComplaints = new Set(complaints.map((item) => item.schoolId)).size;

  $("#statTotal").textContent = complaints.length;
  $("#statMonth").textContent = `${currentMonth} neste mês`;
  $("#statGraves").textContent = graves;
  $("#statGravesPercent").textContent = `${complaints.length ? Math.round((graves / complaints.length) * 100) : 0}% do total`;
  $("#statRecentes").textContent = recent;
  $("#statEscolas").textContent = schoolsWithComplaints;
  $("#statEscolasTotal").textContent = `de ${schools.length} credenciadas`;

  renderSchoolRanking();
  renderSeverityChart();
  renderRecentTable();
}

function renderSchoolRanking() {
  const totals = new Map();
  complaints.forEach((item) => totals.set(item.schoolName, (totals.get(item.schoolName) || 0) + 1));
  const ranking = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = ranking[0]?.[1] || 1;

  $("#schoolRanking").innerHTML = ranking.map(([name, total], index) => `
    <div class="ranking-item">
      <span class="rank-number">${index + 1}</span>
      <span class="ranking-name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(total / max) * 100}%"></div></div>
      <span class="ranking-total">${total} ${total === 1 ? "reg." : "regs."}</span>
    </div>
  `).join("");
}

function renderSeverityChart() {
  const severities = [
    { name: "Grave", className: "high" },
    { name: "Média", className: "medium" },
    { name: "Baixa", className: "low" }
  ];
  const max = Math.max(1, ...severities.map((item) => complaints.filter((c) => c.severity === item.name).length));

  if (!complaints.length) {
    $("#severityChart").innerHTML = "";
    return;
  }

  $("#severityChart").innerHTML = severities.map((item) => {
    const total = complaints.filter((complaint) => complaint.severity === item.name).length;
    return `
      <div class="severity-row ${item.className}">
        <span class="label">${item.name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(total / max) * 100}%"></div></div>
        <span class="value">${total}</span>
      </div>
    `;
  }).join("");
}

function renderRecentTable() {
  const rows = complaints.slice(0, 5);
  $("#recentTable").innerHTML = rows.length ? rows.map(complaintRow).join("") : emptyTableRow(6);
  bindDetailButtons();
}

function renderComplaintsList() {
  const search = normalize($("#searchInput").value);
  const severity = $("#severityFilter").value;
  const schoolId = $("#schoolFilter").value;

  const filtered = complaints.filter((item) => {
    const matchesSearch = !search || normalize(`${item.number} ${item.schoolName} ${item.report}`).includes(search);
    const matchesSeverity = !severity || item.severity === severity;
    const matchesSchool = !schoolId || item.schoolId === schoolId;
    return matchesSearch && matchesSeverity && matchesSchool;
  });

  $("#resultCount").textContent = filtered.length;
  $("#complaintsTable").innerHTML = filtered.map(complaintRow).join("");
  $("#complaintsEmpty").classList.toggle("hidden", filtered.length > 0);
  bindDetailButtons();
}

function complaintRow(item) {
  return `
    <tr>
      <td><button class="number-link" data-detail-id="${item.id}">${escapeHtml(item.number)}</button></td>
      <td>${formatDateTime(item.createdAt)}</td>
      <td>${escapeHtml(item.schoolName)}</td>
      <td>${severityBadge(item.severity)}</td>
      <td>${escapeHtml(complaintAuthor(item))}</td>
      <td>
        <div class="table-actions">
          <button class="text-button" data-detail-id="${item.id}">Detalhes →</button>
          <button class="text-button print-link" data-print-id="${item.id}">Imprimir</button>
        </div>
      </td>
    </tr>
  `;
}

function emptyTableRow(columns) {
  return `<tr><td colspan="${columns}" style="text-align:center;color:#8a9aa2;padding:28px">Nenhum registro até o momento.</td></tr>`;
}

function bindDetailButtons() {
  $$("[data-detail-id]").forEach((button) => {
    button.addEventListener("click", () => openComplaintDetail(button.dataset.detailId));
  });
  $$("[data-print-id]").forEach((button) => {
    button.addEventListener("click", () => printComplaint(button.dataset.printId));
  });
}

function printComplaint(id) {
  const complaint = complaints.find((item) => item.id === id);
  if (!complaint) {
    showToast("Registro não encontrado para impressão.", true);
    return;
  }

  const narrative = extractNarrativeForPrint(complaint.report);
  const printedAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    showToast("Permita pop-ups no navegador para imprimir o registro.", true);
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Denúncia ${escapeHtml(complaint.number)}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 20mm 18mm 18mm;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #111;
        background: #fff;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12pt;
        line-height: 1.55;
      }
      .document {
        width: 100%;
        min-height: 257mm;
        display: flex;
        flex-direction: column;
      }
      h1 {
        margin: 0 0 20pt;
        font-size: 15pt;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: .04em;
      }
      .identification {
        margin-bottom: 20pt;
        border-top: 1px solid #222;
        border-bottom: 1px solid #222;
        padding: 10pt 0;
      }
      .identification p {
        margin: 2pt 0;
      }
      .label { font-weight: 700; }
      .report {
        margin: 0;
        text-align: justify;
        text-indent: 1.25cm;
        white-space: normal;
        overflow-wrap: anywhere;
      }
      .signatures {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32pt;
        margin-top: auto;
        padding-top: 55pt;
        break-inside: avoid;
      }
      .signature {
        padding-top: 7pt;
        border-top: 1px solid #111;
        text-align: center;
        font-size: 10.5pt;
      }
      .footer {
        margin-top: 22pt;
        color: #555;
        font-size: 8pt;
        text-align: center;
      }
      @media screen {
        body { background: #e9edef; }
        .document {
          width: 210mm;
          margin: 20px auto;
          padding: 20mm 18mm 18mm;
          background: white;
          box-shadow: 0 4px 24px rgba(0,0,0,.14);
        }
      }
      @media print {
        .document { min-height: auto; }
      }
    </style>
  </head>
  <body>
    <main class="document">
      <h1>Registro Formal de Denúncia</h1>
      <section class="identification">
        <p><span class="label">Número da denúncia:</span> ${escapeHtml(complaint.number)}</p>
        <p><span class="label">Escola:</span> ${escapeHtml(complaint.schoolName)}</p>
        <p><span class="label">Data e horário do atendimento:</span> ${escapeHtml(formatDateTime(complaint.createdAt))}</p>
        <p><span class="label">Registrado por:</span> ${escapeHtml(complaintAuthor(complaint))}</p>
      </section>
      <p class="report">${escapeHtml(narrative)}</p>
      <section class="signatures">
        <div class="signature">Assinatura do(a) Fiscal</div>
        <div class="signature">Assinatura do(a) Responsável</div>
      </section>
      <div class="footer">Documento emitido pelo Controle de Denúncias em ${escapeHtml(printedAt)}.</div>
    </main>
    <script>
      window.addEventListener("load", () => {
        window.focus();
        setTimeout(() => window.print(), 250);
      });
    <\/script>
  </body>
  </html>`);
  printWindow.document.close();
}

function extractNarrativeForPrint(report = "") {
  const lines = String(report).split(/\r?\n/).map((line) => line.trim());
  const ignoredPatterns = [
    /^REGISTRO FORMAL (DA|DE) DENÚNCIA$/i,
    /^Escola:/i,
    /^Data e horário do atendimento:/i,
    /^_+$/,
    /^Assinatura do\(a\) Fiscal$/i,
    /^Assinatura do\(a\) Responsável$/i
  ];
  return lines
    .filter(Boolean)
    .filter((line) => !ignoredPatterns.some((pattern) => pattern.test(line)))
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function openComplaintDetail(id) {
  const complaint = complaints.find((item) => item.id === id);
  if (!complaint) return;
  activeComplaintId = id;
  $("#modalTitle").textContent = `Denúncia ${complaint.number}`;

  $("#modalContent").innerHTML = `
    <div class="detail-grid">
      <div class="detail-card"><span>Escola</span><strong>${escapeHtml(complaint.schoolName)}</strong></div>
      <div class="detail-card"><span>Data e horário</span><strong>${formatDateTime(complaint.createdAt)}</strong></div>
      <div class="detail-card"><span>Classificação</span><strong>${severityBadge(complaint.severity)}</strong></div>
      <div class="detail-card"><span>Registrado por</span><strong>${escapeHtml(complaintAuthor(complaint))}</strong></div>
    </div>
    <div class="report-box">
      <h3>Relato do ocorrido</h3>
      <p>${escapeHtml(complaint.report)}</p>
    </div>
  `;
  $("#detailModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("#detailModal").classList.add("hidden");
  document.body.style.overflow = "";
  activeComplaintId = null;
}

async function deleteActiveComplaint() {
  if (!activeComplaintId) return;
  const complaint = complaints.find((item) => item.id === activeComplaintId);
  if (!complaint || !window.confirm(`Excluir definitivamente a denúncia ${complaint.number}?`)) return;

  await removeComplaint(complaint);
  closeModal();
  await refreshData();
  renderAll();
  showToast("Denúncia excluída.");
}

function exportCsv() {
  if (!complaints.length) {
    showToast("Não há denúncias para exportar.", true);
    return;
  }

  const header = ["Número", "Data e horário", "Escola", "Gravidade", "Registrado por", "Relato"];
  const rows = complaints.map((item) => [
    item.number,
    formatDateTime(item.createdAt),
    item.schoolName,
    item.severity,
    complaintAuthor(item),
    item.report
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
  downloadBlob(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), `denuncias-${dateStamp()}.csv`);
  showToast("Planilha CSV exportada.");
}

async function exportBackup() {
  const backup = {
    application: "Controle de Denúncias Escolares",
    version: 2,
    exportedAt: new Date().toISOString(),
    schools,
    complaints
  };
  downloadBlob(
    new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
    `backup-denuncias-${dateStamp()}.json`
  );
  showToast("Backup exportado com sucesso.");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function severityBadge(severity) {
  const className = severity === "Grave" ? "grave" : severity === "Média" ? "media" : "baixa";
  const label = severity === "Média" ? "Média gravidade" : severity === "Baixa" ? "Baixa gravidade" : "Grave";
  return `<span class="severity-badge ${className}">${label}</span>`;
}

function complaintAuthor(complaint) {
  return complaint.createdByEmail || complaint.createdByName || "Não identificado";
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function normalize(value = "") {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3400);
}

function authErrorMessage(error) {
  const code = error?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "E-mail ou senha inválidos.";
  }
  if (code.includes("too-many-requests")) return "Muitas tentativas. Aguarde alguns minutos.";
  if (code.includes("invalid-email")) return "Informe um endereço de e-mail válido.";
  if (code.includes("network-request-failed")) return "Falha de conexão. Verifique a internet.";
  return error?.message || "Não foi possível concluir a autenticação.";
}
