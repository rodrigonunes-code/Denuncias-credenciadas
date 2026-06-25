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

const DEFAULT_FINAL_STATUS = "Em análise";
const FINAL_STATUS_OPTIONS = [
  "Em análise",
  "Em acompanhamento",
  "Encaminhada",
  "Finalizada",
  "Resolvida",
  "Resolvido com a escola",
  "Transferência realizada",
  "Procedente",
  "Improcedente",
  "Arquivada"
];
const SCHOOL_IMPORT_ALIASES = {
  "cubinho da fe": ["clubinho da fe"],
  "castelinho amarelo": ["castelo amarelo"],
  "escola colore": ["colore"],
  "intituto anjos e marmanjos": ["instituto anjos e marmanjos"],
  "geracao vida centro i": ["geracao vida centro"],
  "geracao vida olaria": ["geracao olaria"],
  "geracao vida unidade estancia": ["geracao estancia"],
  "tia neca": ["tia neca guajuviras"],
  "sao jose": ["sao jose"],
  "vo maria": ["vo maria"],
  "exito": ["exito"],
  "baby": ["baby rio branco"]
};

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
      setDefaultAttendanceDateTime();
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
  complaints.sort((a, b) => new Date(getComplaintDateTime(b)) - new Date(getComplaintDateTime(a)));
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
  $("#attendanceDate").addEventListener("change", updateNextNumber);
  $("#attendanceTime").addEventListener("change", updateNextNumber);
  $("#reportText").addEventListener("input", updateCharCount);
  $("#formalizeAiBtn").addEventListener("click", formalizeReportWithAi);
  $("#restoreOriginalBtn").addEventListener("click", restoreOriginalReport);
  $("#clearFormBtn").addEventListener("click", clearComplaintForm);
  $("#searchInput").addEventListener("input", renderComplaintsList);
  $("#severityFilter").addEventListener("change", renderComplaintsList);
  $("#classificationFilter").addEventListener("change", renderComplaintsList);
  $("#statusFilter").addEventListener("change", renderComplaintsList);
  $("#schoolFilter").addEventListener("change", renderComplaintsList);
  $("#listStartDate").addEventListener("change", renderComplaintsList);
  $("#listEndDate").addEventListener("change", renderComplaintsList);
  $("#clearListDateFilterBtn").addEventListener("click", clearListDateFilter);
  $("#dashboardStartDate").addEventListener("change", renderDashboard);
  $("#dashboardEndDate").addEventListener("change", renderDashboard);
  $("#clearDashboardDateFilterBtn").addEventListener("click", clearDashboardDateFilter);
  $("#importSpreadsheetBtn").addEventListener("click", () => $("#importSpreadsheetInput").click());
  $("#importSpreadsheetInput").addEventListener("change", importSpreadsheet);
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

function setDefaultAttendanceDateTime() {
  const now = new Date();
  if ($("#attendanceDate") && !$("#attendanceDate").value) {
    $("#attendanceDate").value = toDateInputValue(now);
  }
  if ($("#attendanceTime") && !$("#attendanceTime").value) {
    $("#attendanceTime").value = toTimeInputValue(now);
  }
  if ($("#finalStatusInput") && !$("#finalStatusInput").value) {
    $("#finalStatusInput").value = DEFAULT_FINAL_STATUS;
  }
}

async function getNextComplaintNumber() {
  const attendanceAt = getAttendanceAtFromForm();
  const year = attendanceAt ? new Date(attendanceAt).getFullYear() : new Date().getFullYear();
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

function getAttendanceAtFromForm() {
  const date = $("#attendanceDate")?.value || "";
  const time = $("#attendanceTime")?.value || "00:00";
  if (!date) return "";
  const value = new Date(`${date}T${time || "00:00"}:00`);
  return Number.isNaN(value.getTime()) ? "" : value.toISOString();
}

function getComplaintDateTime(complaint) {
  return complaint.attendanceAt || complaint.createdAt;
}

function getDateRange(startSelector, endSelector) {
  const startValue = $(startSelector)?.value || "";
  const endValue = $(endSelector)?.value || "";
  return {
    start: startValue ? new Date(`${startValue}T00:00:00`) : null,
    end: endValue ? new Date(`${endValue}T23:59:59`) : null
  };
}

function isComplaintWithinDateRange(complaint, range) {
  const date = new Date(getComplaintDateTime(complaint));
  if (range.start && date < range.start) return false;
  if (range.end && date > range.end) return false;
  return true;
}

function getDashboardComplaints() {
  return complaints.filter((item) => isComplaintWithinDateRange(item, getDateRange("#dashboardStartDate", "#dashboardEndDate")));
}

function isDashboardDateFiltered() {
  return Boolean($("#dashboardStartDate")?.value || $("#dashboardEndDate")?.value);
}

function clearDashboardDateFilter() {
  $("#dashboardStartDate").value = "";
  $("#dashboardEndDate").value = "";
  renderDashboard();
}

function clearListDateFilter() {
  $("#listStartDate").value = "";
  $("#listEndDate").value = "";
  renderComplaintsList();
}

async function submitComplaint(event) {
  event.preventDefault();
  const schoolId = $("#schoolSelect").value;
  const attendanceAt = getAttendanceAtFromForm();
  const classification = $("#classificationInput").value.trim();
  const severity = document.querySelector('input[name="severity"]:checked')?.value;
  const finalStatus = $("#finalStatusInput").value.trim() || DEFAULT_FINAL_STATUS;
  const actionsTaken = $("#actionsTakenText").value.trim();
  const report = $("#reportText").value.trim();
  const school = schools.find((item) => item.id === schoolId);

  if (!school || !attendanceAt || !classification || !severity || !report) {
    showToast("Preencha os campos obrigatórios.", true);
    return;
  }

  setComplaintSaving(true);
  try {
    const number = await createComplaint({
      schoolId,
      schoolName: school.name,
      attendanceAt,
      attendanceTimeKnown: true,
      classification,
      severity,
      finalStatus,
      actionsTaken,
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
  const hasContent = $("#schoolSelect").value || $("#reportText").value || $("#classificationInput").value || $("#actionsTakenText").value;
  if (confirmClear && hasContent && !window.confirm("Deseja limpar os dados preenchidos?")) return;
  $("#complaintForm").reset();
  setDefaultAttendanceDateTime();
  originalReportBeforeAi = "";
  $("#aiResultActions").classList.add("hidden");
  updateCharCount();
  updateNextNumber();
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
        receivedAt: getAttendanceAtFromForm() || new Date().toISOString()
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
  const classificationFilterValue = $("#classificationFilter")?.value || "";
  const statusFilterValue = $("#statusFilter")?.value || "";
  const options = schools.map((school) => `<option value="${school.id}">${escapeHtml(school.name)}</option>`).join("");
  $("#schoolSelect").innerHTML = `<option value="">Selecione a escola</option>${options}`;
  $("#schoolFilter").innerHTML = `<option value="">Todas as escolas</option>${options}`;
  $("#schoolSelect").value = complaintValue;
  $("#schoolFilter").value = filterValue;

  const classifications = uniqueSorted(complaints.map((item) => item.classification).filter(Boolean));
  $("#classificationFilter").innerHTML = `<option value="">Todas as classificações</option>${classifications.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}`;
  $("#classificationFilter").value = classificationFilterValue;

  const statuses = uniqueSorted([...FINAL_STATUS_OPTIONS, ...complaints.map((item) => item.finalStatus).filter(Boolean)]);
  $("#statusFilter").innerHTML = `<option value="">Todas as situações</option>${statuses.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}`;
  $("#statusFilter").value = statusFilterValue;
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
  const dashboardComplaints = getDashboardComplaints();
  const now = new Date();
  const currentMonth = dashboardComplaints.filter((item) => {
    const date = new Date(getComplaintDateTime(item));
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const graves = dashboardComplaints.filter((item) => item.severity === "Grave").length;
  const inAnalysis = dashboardComplaints.filter((item) => normalizeStatus(item.finalStatus) === normalizeStatus(DEFAULT_FINAL_STATUS)).length;
  const finished = dashboardComplaints.filter((item) => isFinalizedStatus(item.finalStatus)).length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recent = dashboardComplaints.filter((item) => new Date(getComplaintDateTime(item)) >= thirtyDaysAgo).length;
  const schoolsWithComplaints = new Set(dashboardComplaints.map((item) => item.schoolId)).size;

  $("#statTotal").textContent = dashboardComplaints.length;
  $("#statMonth").textContent = isDashboardDateFiltered() ? `${dashboardComplaints.length} no período` : `${currentMonth} neste mês`;
  $("#statGraves").textContent = graves;
  $("#statGravesPercent").textContent = `${dashboardComplaints.length ? Math.round((graves / dashboardComplaints.length) * 100) : 0}% do total`;
  $("#statRecentes").textContent = recent;
  $("#statEscolas").textContent = schoolsWithComplaints;
  $("#statEscolasTotal").textContent = `de ${schools.length} credenciadas`;
  $("#statAnalise").textContent = inAnalysis;
  $("#statFinalizadas").textContent = finished;

  renderSchoolRanking(dashboardComplaints);
  renderSeverityChart(dashboardComplaints);
  renderClassificationChart(dashboardComplaints);
  renderStatusChart(dashboardComplaints);
  renderRecentTable(dashboardComplaints);
}

function renderSchoolRanking(source = complaints) {
  const totals = new Map();
  source.forEach((item) => totals.set(item.schoolName, (totals.get(item.schoolName) || 0) + 1));
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

function renderSeverityChart(source = complaints) {
  const severities = [
    { name: "Grave", className: "high" },
    { name: "Média", className: "medium" },
    { name: "Baixa", className: "low" }
  ];
  const max = Math.max(1, ...severities.map((item) => source.filter((c) => c.severity === item.name).length));

  if (!source.length) {
    $("#severityChart").innerHTML = "";
    return;
  }

  $("#severityChart").innerHTML = severities.map((item) => {
    const total = source.filter((complaint) => complaint.severity === item.name).length;
    return `
      <div class="severity-row ${item.className}">
        <span class="label">${item.name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(total / max) * 100}%"></div></div>
        <span class="value">${total}</span>
      </div>
    `;
  }).join("");
}

function renderClassificationChart(source = complaints) {
  renderDistributionChart("#classificationChart", source.map((item) => item.classification || "Não informada"), source.length);
}

function renderStatusChart(source = complaints) {
  renderDistributionChart("#statusChart", source.map((item) => item.finalStatus || DEFAULT_FINAL_STATUS), source.length);
}

function renderDistributionChart(selector, values, totalSource = complaints.length) {
  const element = $(selector);
  if (!element) return;
  if (!totalSource) {
    element.innerHTML = "";
    return;
  }

  const totals = new Map();
  values.forEach((value) => {
    const label = String(value || "Não informada").trim() || "Não informada";
    totals.set(label, (totals.get(label) || 0) + 1);
  });

  const ranking = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = ranking[0]?.[1] || 1;
  element.innerHTML = ranking.map(([label, total]) => `
    <div class="distribution-row">
      <span class="label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(total / max) * 100}%"></div></div>
      <span class="value">${total}</span>
    </div>
  `).join("");
}

function renderRecentTable(source = complaints) {
  const rows = source.slice(0, 5);
  $("#recentTable").innerHTML = rows.length ? rows.map(complaintRow).join("") : emptyTableRow(8);
  bindDetailButtons();
}

function renderComplaintsList() {
  const search = normalize($("#searchInput").value);
  const severity = $("#severityFilter").value;
  const classification = $("#classificationFilter").value;
  const finalStatus = $("#statusFilter").value;
  const schoolId = $("#schoolFilter").value;
  const dateRange = getDateRange("#listStartDate", "#listEndDate");

  const filtered = complaints.filter((item) => {
    const matchesSearch = !search || normalize(`${item.number} ${item.schoolName} ${item.classification || ""} ${item.finalStatus || ""} ${item.actionsTaken || ""} ${item.report}`).includes(search);
    const matchesSeverity = !severity || item.severity === severity;
    const matchesClassification = !classification || item.classification === classification;
    const matchesStatus = !finalStatus || item.finalStatus === finalStatus;
    const matchesSchool = !schoolId || item.schoolId === schoolId;
    const matchesDate = isComplaintWithinDateRange(item, dateRange);
    return matchesSearch && matchesSeverity && matchesClassification && matchesStatus && matchesSchool && matchesDate;
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
      <td>${formatComplaintDateTime(item)}</td>
      <td>${escapeHtml(item.schoolName)}</td>
      <td>${escapeHtml(item.classification || "Não informada")}</td>
      <td>${severityBadge(item.severity)}</td>
      <td>${escapeHtml(item.finalStatus || DEFAULT_FINAL_STATUS)}</td>
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
        <p><span class="label">Data e horário do atendimento:</span> ${escapeHtml(formatComplaintDateTime(complaint))}</p>
        <p><span class="label">Classificação da denúncia:</span> ${escapeHtml(complaint.classification || "Não informada")}</p>
        <p><span class="label">Gravidade:</span> ${escapeHtml(severityLabel(complaint.severity))}</p>
        <p><span class="label">Situação final:</span> ${escapeHtml(complaint.finalStatus || DEFAULT_FINAL_STATUS)}</p>
        <p><span class="label">Registrado por:</span> ${escapeHtml(complaintAuthor(complaint))}</p>
      </section>
      <p class="report">${escapeHtml(narrative)}</p>
      ${complaint.actionsTaken ? `<section class="identification"><p><span class="label">Providências adotadas:</span> ${escapeHtml(complaint.actionsTaken)}</p></section>` : ""}
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
      <div class="detail-card"><span>Data e horário</span><strong>${formatComplaintDateTime(complaint)}</strong></div>
      <div class="detail-card"><span>Classificação da denúncia</span><strong>${escapeHtml(complaint.classification || "Não informada")}</strong></div>
      <div class="detail-card"><span>Gravidade</span><strong>${severityBadge(complaint.severity)}</strong></div>
      <div class="detail-card"><span>Situação final</span><strong>${escapeHtml(complaint.finalStatus || DEFAULT_FINAL_STATUS)}</strong></div>
      <div class="detail-card"><span>Registrado por</span><strong>${escapeHtml(complaintAuthor(complaint))}</strong></div>
    </div>
    <div class="report-box">
      <h3>Relato do ocorrido</h3>
      <p>${escapeHtml(complaint.report)}</p>
    </div>
    <div class="report-box">
      <h3>Providências adotadas</h3>
      <p>${escapeHtml(complaint.actionsTaken || "Não informadas.")}</p>
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

async function importSpreadsheet(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  if (!window.XLSX) {
    showToast("O leitor de planilhas ainda não foi carregado. Atualize a página e tente novamente.", true);
    return;
  }

  const button = $("#importSpreadsheetBtn");
  button.disabled = true;
  button.textContent = "Lendo planilha...";

  try {
    const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
    const firstSheetName = workbook.SheetNames[0];
    const firstSheet = workbook.Sheets[firstSheetName];
    const matrix = window.XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "", raw: false });
    const rows = buildImportRowsFromFirstSheet(matrix);

    if (!rows.length) {
      showToast("A primeira aba da planilha não possui denúncias para importar.", true);
      return;
    }

    const { validRows, problems } = prepareImportRows(rows);
    if (problems.length) {
      downloadImportReport(problems);
      showToast(`Importação não realizada. Corrija as ${problems.length} pendência(s) do relatório baixado.`, true);
      return;
    }

    if (!validRows.length) {
      showToast("Nenhuma denúncia válida encontrada na primeira aba.", true);
      return;
    }

    const confirmed = window.confirm(
      `Importar ${validRows.length} denúncia(s) da primeira aba "${firstSheetName}"?\n\n` +
      "Atenção: evite importar a mesma planilha mais de uma vez para não duplicar registros."
    );
    if (!confirmed) return;

    for (let index = 0; index < validRows.length; index += 1) {
      button.textContent = `Importando ${index + 1}/${validRows.length}...`;
      await createComplaint(validRows[index]);
    }

    await refreshData();
    renderAll();
    showToast(`${validRows.length} denúncia(s) importada(s) com sucesso.`);
    switchView("denuncias");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao importar a planilha.", true);
  } finally {
    button.disabled = false;
    button.textContent = "Importar planilha";
  }
}

function prepareImportRows(rows) {
  const validRows = [];
  const problems = [];
  const existingKeys = new Set(complaints.map((item) => duplicateKey(item.schoolId, getComplaintDateTime(item), item.report)));
  const pendingKeys = new Set();

  rows.forEach((row, index) => {
    const line = row.__line || index + 2;
    const rawDate = getImportValue(row, ["Data do Atendimento", "Data do atendimento", "Data"]);
    const rawSchool = getImportValue(row, ["Escola", "Nome da escola"]);
    const rawReport = getImportValue(row, ["Relato da Denúncia", "Relato da denúncia", "Relato"]);
    const rawClassification = getImportValue(row, ["Classificação da Denúncia", "Classificacao da Denuncia", "Classificação"]);
    const rawSeverity = getImportValue(row, ["Gravidade", "Classificação de gravidade"]);
    const rawFinalStatus = getImportValue(row, ["Situação Final", "Situacao Final", "Situação"]);
    const rawActionsTaken = getImportValue(row, ["Providências Adotadas", "Providencias Adotadas", "Providências"]);

    if (!Object.values(row).some((value) => String(value || "").trim())) return;

    const date = parseImportDate(rawDate);
    if (!date) problems.push(importProblem(line, "Data do atendimento", rawDate, "Data inválida. Use o formato dd/mm/aaaa."));

    const school = findSchoolMatch(rawSchool);
    if (!school) problems.push(importProblem(line, "Escola", rawSchool, "Não foi possível relacionar com a lista de escolas cadastradas."));

    const severity = normalizeSeverity(rawSeverity);
    if (!severity) problems.push(importProblem(line, "Gravidade", rawSeverity, "Use Baixa, Média ou Grave."));

    const report = String(rawReport || "").trim();
    if (report.length < 5) problems.push(importProblem(line, "Relato da denúncia", rawReport, "Relato vazio ou muito curto."));

    const classification = String(rawClassification || "").trim();
    if (!classification) problems.push(importProblem(line, "Classificação da denúncia", rawClassification, "Campo obrigatório."));

    if (!date || !school || !severity || !report || !classification) return;

    const key = duplicateKey(school.id, date.iso, report);
    if (existingKeys.has(key) || pendingKeys.has(key)) {
      problems.push(importProblem(line, "Duplicidade", rawSchool, "Possível denúncia duplicada pela mesma escola, data e relato."));
      return;
    }
    pendingKeys.add(key);

    validRows.push({
      schoolId: school.id,
      schoolName: school.name,
      attendanceAt: date.iso,
      attendanceTimeKnown: date.timeKnown,
      classification,
      severity,
      finalStatus: String(rawFinalStatus || "").trim() || DEFAULT_FINAL_STATUS,
      actionsTaken: String(rawActionsTaken || "").trim(),
      report
    });
  });

  return { validRows, problems };
}

function buildImportRowsFromFirstSheet(matrix) {
  const knownHeaders = [
    "Data do Atendimento",
    "Escola",
    "Relato da Denúncia",
    "Classificação da Denúncia",
    "Gravidade",
    "Situação Final",
    "Providências Adotadas"
  ].map(normalizeHeader);

  const headerIndex = matrix.findIndex((row) => {
    const normalized = row.map(normalizeHeader);
    return knownHeaders.filter((header) => normalized.includes(header)).length >= 4;
  });

  if (headerIndex < 0) {
    throw new Error("Não encontrei a linha de cabeçalho na primeira aba. Verifique se ela contém Data do Atendimento, Escola, Relato da Denúncia, Classificação da Denúncia, Gravidade, Situação Final e Providências Adotadas.");
  }

  const headers = matrix[headerIndex].map((header) => String(header || "").trim());
  return matrix.slice(headerIndex + 1).map((row, offset) => {
    const item = { __line: headerIndex + offset + 2 };
    headers.forEach((header, columnIndex) => {
      if (header) item[header] = row[columnIndex] ?? "";
    });
    return item;
  }).filter((row) => Object.entries(row).some(([key, value]) => key !== "__line" && String(value || "").trim()));
}

function getImportValue(row, candidates) {
  const normalizedCandidates = candidates.map(normalizeHeader);
  const key = Object.keys(row).find((item) => normalizedCandidates.includes(normalizeHeader(item)));
  return key ? row[key] : "";
}

function normalizeHeader(value = "") {
  return normalize(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function parseImportDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const brMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (brMatch) {
    const [, day, month, year, hour = "12", minute = "00"] = brMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0);
    if (!Number.isNaN(date.getTime())) return { iso: date.toISOString(), timeKnown: Boolean(brMatch[4]) };
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return { iso: parsed.toISOString(), timeKnown: /:\d{2}/.test(raw) };

  return null;
}

function normalizeSeverity(value = "") {
  const normalized = normalize(value);
  if (normalized.includes("grave")) return "Grave";
  if (normalized.includes("media")) return "Média";
  if (normalized.includes("baixa")) return "Baixa";
  return "";
}

function findSchoolMatch(value = "") {
  const target = normalizeSchoolForMatch(value);
  if (!target) return null;

  const exact = schools.find((school) => normalizeSchoolForMatch(school.name) === target);
  if (exact) return exact;

  const aliasNeedles = SCHOOL_IMPORT_ALIASES[target] || [];
  for (const needle of aliasNeedles) {
    const match = uniqueSchoolMatch((school) => normalizeSchoolForMatch(school.name).includes(needle));
    if (match) return match;
  }

  return uniqueSchoolMatch((school) => {
    const official = normalizeSchoolForMatch(school.name);
    return official.includes(target) || target.includes(official);
  });
}

function uniqueSchoolMatch(predicate) {
  const matches = schools.filter(predicate);
  return matches.length === 1 ? matches[0] : null;
}

function normalizeSchoolForMatch(value = "") {
  return normalize(value)
    .replace(/\bee?i\b/g, " ")
    .replace(/\bescola\b/g, " ")
    .replace(/\bcreche\b/g, " ")
    .replace(/\bprivada\b/g, " ")
    .replace(/\bsem fins lucrativos\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function duplicateKey(schoolId, dateValue, report) {
  const date = dateValue ? new Date(dateValue).toISOString().slice(0, 10) : "";
  return `${schoolId}|${date}|${normalize(report).slice(0, 140)}`;
}

function importProblem(line, field, value, problem) {
  return { line, field, value: String(value || ""), problem };
}

function downloadImportReport(problems) {
  const header = ["Linha", "Campo", "Valor", "Pendência"];
  const rows = problems.map((item) => [item.line, item.field, item.value, item.problem]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
  downloadBlob(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), `pendencias-importacao-${dateStamp()}.csv`);
}

function exportCsv() {
  if (!complaints.length) {
    showToast("Não há denúncias para exportar.", true);
    return;
  }

  const header = ["Número", "Data do atendimento", "Escola", "Classificação da denúncia", "Gravidade", "Situação final", "Providências adotadas", "Registrado por", "Relato"];
  const rows = complaints.map((item) => [
    item.number,
    formatComplaintDateTime(item),
    item.schoolName,
    item.classification || "",
    item.severity,
    item.finalStatus || DEFAULT_FINAL_STATUS,
    item.actionsTaken || "",
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

function severityLabel(severity) {
  if (severity === "Média" || severity === "MÃ©dia") return "Média gravidade";
  if (severity === "Baixa") return "Baixa gravidade";
  return "Grave";
}

function complaintAuthor(complaint) {
  return complaint.createdByEmail || complaint.createdByName || "Não identificado";
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function normalizeStatus(value = "") {
  return normalize(value).trim();
}

function isFinalizedStatus(value = "") {
  const status = normalizeStatus(value);
  return [
    "finalizada",
    "resolvida",
    "resolvido com a escola",
    "transferencia realizada",
    "procedente",
    "improcedente",
    "arquivada"
  ].includes(status);
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

function formatDateOnly(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatComplaintDateTime(complaint) {
  const value = getComplaintDateTime(complaint);
  return complaint.attendanceTimeKnown === false ? formatDateOnly(value) : formatDateTime(value);
}

function toDateInputValue(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toTimeInputValue(value) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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
