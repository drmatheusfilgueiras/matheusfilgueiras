<?php
declare(strict_types=1);

// Public read-only MCP endpoint. No administrative or patient data is exposed.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('MCP-Protocol-Version: 2025-06-18');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && $origin !== 'https://matheusfilgueiras.com') {
    http_response_code(403);
    echo json_encode(['error' => 'Origin not permitted'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    echo json_encode(['error' => 'Use POST with JSON-RPC 2.0'], JSON_UNESCAPED_UNICODE);
    exit;
}

$length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($length > 16384) {
    http_response_code(413);
    echo json_encode(['error' => 'Request too large'], JSON_UNESCAPED_UNICODE);
    exit;
}

$request = json_decode(file_get_contents('php://input'), true);
if (!is_array($request) || ($request['jsonrpc'] ?? '') !== '2.0' || !is_string($request['method'] ?? null)) {
    http_response_code(400);
    echo json_encode(['jsonrpc' => '2.0', 'id' => null, 'error' => ['code' => -32600, 'message' => 'Invalid request']], JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $request['method'];
$id = $request['id'] ?? null;
if ($id === null && str_starts_with($method, 'notifications/')) {
    http_response_code(202);
    exit;
}
if ($id === null) {
    http_response_code(400);
    echo json_encode(['jsonrpc' => '2.0', 'id' => null, 'error' => ['code' => -32600, 'message' => 'Request id required']], JSON_UNESCAPED_UNICODE);
    exit;
}

$base = 'https://matheusfilgueiras.com';
$projects = [
    ['name' => 'Unidos pela Bravura', 'description' => 'Livro infantil sobre medo e ansiedade no atendimento odontológico.', 'url' => $base . '/unidos_pela_bravura'],
    ['name' => 'Pesquisa de mestrado', 'description' => 'Citotoxicidade de resinas impressas para próteses totais removíveis. Pesquisa em andamento.', 'url' => $base . '/#projetos-apple'],
    ['name' => 'Planejamento Estético Digital', 'description' => 'E-book e atividades de ensino sobre planejamento estético digital 2D.', 'url' => $base . '/#projetos-apple'],
    ['name' => 'SedaFlow', 'description' => 'Projeto de software para registros de sedação consciente.', 'url' => 'https://sedaflow.com.br/'],
];
$tools = [
    [
        'name' => 'get_public_profile',
        'description' => 'Consulta informações públicas de identificação profissional do titular do site.',
        'inputSchema' => ['type' => 'object', 'properties' => new stdClass(), 'additionalProperties' => false]
    ],
    [
        'name' => 'list_public_projects',
        'description' => 'Lista os projetos públicos, com links de apresentação.',
        'inputSchema' => ['type' => 'object', 'properties' => new stdClass(), 'additionalProperties' => false]
    ],
    [
        'name' => 'get_contact_options',
        'description' => 'Retorna canais públicos de contato; não envia mensagens ou realiza agendamentos.',
        'inputSchema' => ['type' => 'object', 'properties' => new stdClass(), 'additionalProperties' => false]
    ]
];

switch ($method) {
    case 'initialize':
        $result = [
            'protocolVersion' => '2025-06-18',
            'capabilities' => ['tools' => ['listChanged' => false]],
            'serverInfo' => ['name' => 'matheusfilgueiras.com/public-portfolio', 'version' => '1.0.0'],
            'instructions' => 'Somente conteúdo público. Nenhuma ferramenta realiza alterações, marca consultas ou consulta dados de pacientes.'
        ];
        break;
    case 'ping':
        $result = new stdClass();
        break;
    case 'tools/list':
        $result = ['tools' => $tools];
        break;
    case 'tools/call':
        $params = $request['params'] ?? [];
        $tool = is_array($params) ? ($params['name'] ?? '') : '';
        switch ($tool) {
            case 'get_public_profile':
                $data = ['name' => 'Matheus Filgueiras', 'profession' => 'Cirurgião-dentista', 'registration' => 'CRO/RJ 59298', 'academic' => 'Mestrando em Odontologia pela UFF', 'website' => $base, 'location' => 'Nova Friburgo, RJ, Brasil'];
                break;
            case 'list_public_projects':
                $data = ['projects' => $projects];
                break;
            case 'get_contact_options':
                $data = [
                    'email' => 'matheusfilgueiras.dr@gmail.com',
                    'contactPage' => $base . '/contato',
                    'clinics' => ['Salud Odontologia', 'Naturale Dental Studio'],
                    'notice' => 'Nenhuma consulta é marcada por esta ferramenta.'
                ];
                break;
            default:
                echo json_encode(['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => -32602, 'message' => 'Unknown tool']], JSON_UNESCAPED_UNICODE);
                exit;
        }
        $result = ['content' => [['type' => 'text', 'text' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]]], 'isError' => false];
        break;
    default:
        echo json_encode(['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => -32601, 'message' => 'Method not found']], JSON_UNESCAPED_UNICODE);
        exit;
}
echo json_encode(['jsonrpc' => '2.0', 'id' => $id, 'result' => $result], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
