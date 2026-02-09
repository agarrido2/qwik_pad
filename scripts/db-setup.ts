/**
 * Script de setup: Trigger, Seeds y RLS
 * Ejecutar con: bun run db:setup
 */

import postgres from 'postgres';

const sql = postgres(process.env.DIRECT_URL!);

async function setup() {
  console.log('🔧 Aplicando trigger, seeds y RLS...\n');

  // ═══════════════════════════════════════════
  // 1. TRIGGER: handle_new_user()
  // ═══════════════════════════════════════════
  console.log('1️⃣  Creando trigger handle_new_user()...');
  await sql.unsafe(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.users (id, email, full_name, has_completed_onboarding)
      VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        false
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  `);
  console.log('   ✅ Trigger creado\n');

  // ═══════════════════════════════════════════
  // 2. SEEDS: industry_types
  // ═══════════════════════════════════════════
  console.log('2️⃣  Insertando datos de industry_types...');
  await sql.unsafe(`
    INSERT INTO public.industry_types (slug, name, description, icon) VALUES
      ('concesionario', 'Concesionario de Vehículos', 'Venta y posventa de vehículos', '🚗'),
      ('inmobiliaria', 'Inmobiliaria', 'Compra, venta y alquiler de propiedades', '🏠'),
      ('alquiladora', 'Alquiladora de Vehículos/Maquinaria', 'Alquiler de equipos y vehículos', '🚛'),
      ('despacho', 'Despacho Profesional', 'Abogados, asesores, gestorías', '⚖️'),
      ('retail', 'Retail / Distribuidora', 'Comercio minorista y distribución', '🛒'),
      ('sat', 'Servicio Técnico (SAT)', 'Reparación y mantenimiento', '🔧'),
      ('clinica', 'Clínica Médica', 'Servicios de salud', '🏥')
    ON CONFLICT (slug) DO NOTHING;
  `);
  console.log('   ✅ 7 sectores insertados\n');

  // ═══════════════════════════════════════════
  // 3. SEEDS: call_flow_templates
  // ═══════════════════════════════════════════
  console.log('3️⃣  Insertando call_flow_templates...');
  await sql.unsafe(`
    INSERT INTO public.call_flow_templates (industry_type_id, name, description, flow_config)
    SELECT id, 'Consulta de Vehículo', 'Flujo para consultas sobre vehículos nuevos',
      '{"steps":[{"type":"greeting","msg":"Buenos días, habla con {company}"},{"type":"identify_intent","options":["compra","posventa","financiacion"]},{"type":"capture_data","fields":["nombre","telefono","modelo"]},{"type":"schedule","calendar":true}]}'::jsonb
    FROM public.industry_types WHERE slug = 'concesionario'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.call_flow_templates (industry_type_id, name, description, flow_config)
    SELECT id, 'Consulta de Propiedad', 'Flujo para consultas inmobiliarias',
      '{"steps":[{"type":"greeting","msg":"Bienvenido a {company}"},{"type":"identify_intent","options":["compra","renta","avaluo"]},{"type":"capture_data","fields":["nombre","telefono","zona","presupuesto"]},{"type":"schedule_visit","calendar":true}]}'::jsonb
    FROM public.industry_types WHERE slug = 'inmobiliaria'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.call_flow_templates (industry_type_id, name, description, flow_config)
    SELECT id, 'Reserva de Vehículo', 'Flujo para alquiler de vehículos',
      '{"steps":[{"type":"greeting","msg":"Hola, bienvenido a {company}"},{"type":"check_availability","fields":["fecha_inicio","fecha_fin","tipo_vehiculo"]},{"type":"capture_data","fields":["nombre","licencia","telefono"]},{"type":"confirm_reservation"}]}'::jsonb
    FROM public.industry_types WHERE slug = 'alquiladora'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.call_flow_templates (industry_type_id, name, description, flow_config)
    SELECT id, 'Consulta Profesional', 'Flujo para despachos profesionales',
      '{"steps":[{"type":"greeting","msg":"Despacho {company}, ¿en qué podemos ayudarle?"},{"type":"identify_intent","options":["fiscal","legal","contable","laboral"]},{"type":"capture_data","fields":["nombre","empresa","telefono"]},{"type":"schedule","calendar":true}]}'::jsonb
    FROM public.industry_types WHERE slug = 'despacho'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.call_flow_templates (industry_type_id, name, description, flow_config)
    SELECT id, 'Atención al Cliente', 'Flujo para retail y distribuidoras',
      '{"steps":[{"type":"greeting","msg":"Gracias por llamar a {company}"},{"type":"identify_intent","options":["producto","pedido","devolucion","horarios"]},{"type":"resolve_or_transfer"}]}'::jsonb
    FROM public.industry_types WHERE slug = 'retail'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.call_flow_templates (industry_type_id, name, description, flow_config)
    SELECT id, 'Soporte Técnico', 'Flujo para servicio técnico',
      '{"steps":[{"type":"greeting","msg":"Servicio técnico {company}"},{"type":"identify_intent","options":["averia","revision","garantia","presupuesto"]},{"type":"create_ticket","fields":["nombre","equipo","descripcion"]},{"type":"schedule","calendar":true}]}'::jsonb
    FROM public.industry_types WHERE slug = 'sat'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.call_flow_templates (industry_type_id, name, description, flow_config)
    SELECT id, 'Cita Médica', 'Flujo para clínicas médicas',
      '{"steps":[{"type":"greeting","msg":"Clínica {company}, ¿en qué podemos ayudarle?"},{"type":"identify_intent","options":["cita","resultados","urgencias","informacion"]},{"type":"capture_data","fields":["nombre","especialidad","preferencia_horario"]},{"type":"schedule","calendar":true}]}'::jsonb
    FROM public.industry_types WHERE slug = 'clinica'
    ON CONFLICT DO NOTHING;
  `);
  console.log('   ✅ 7 templates insertados\n');

  // ═══════════════════════════════════════════
  // 4. RLS POLICIES
  // ═══════════════════════════════════════════
  console.log('4️⃣  Configurando RLS...');

  // Users
  await sql.unsafe(`
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
    CREATE POLICY "Users can view own profile"
      ON public.users FOR SELECT
      USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    CREATE POLICY "Users can update own profile"
      ON public.users FOR UPDATE
      USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
    CREATE POLICY "Service role can insert users"
      ON public.users FOR INSERT
      WITH CHECK (true);
  `);
  console.log('   ✅ RLS users');

  // Organizations
  await sql.unsafe(`
    ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
    CREATE POLICY "Users can view their organizations"
      ON public.organizations FOR SELECT
      USING (
        id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "Owners can update organization" ON public.organizations;
    CREATE POLICY "Owners can update organization"
      ON public.organizations FOR UPDATE
      USING (
        id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid() AND role = 'owner'
        )
      );

    DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
    CREATE POLICY "Authenticated users can create organizations"
      ON public.organizations FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  `);
  console.log('   ✅ RLS organizations');

  // Organization Members
  await sql.unsafe(`
    ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own memberships" ON public.organization_members;
    CREATE POLICY "Users can view own memberships"
      ON public.organization_members FOR SELECT
      USING (user_id = auth.uid());

    DROP POLICY IF EXISTS "Owners can manage members" ON public.organization_members;
    CREATE POLICY "Owners can manage members"
      ON public.organization_members FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid() AND role = 'owner'
        )
      );

    DROP POLICY IF EXISTS "Users can insert own membership" ON public.organization_members;
    CREATE POLICY "Users can insert own membership"
      ON public.organization_members FOR INSERT
      WITH CHECK (user_id = auth.uid());
  `);
  console.log('   ✅ RLS organization_members');

  // Industry Types (read-only, público)
  await sql.unsafe(`
    ALTER TABLE public.industry_types ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view industry types" ON public.industry_types;
    CREATE POLICY "Anyone can view industry types"
      ON public.industry_types FOR SELECT
      USING (true);
  `);
  console.log('   ✅ RLS industry_types');

  // Call Flow Templates (read-only, público)
  await sql.unsafe(`
    ALTER TABLE public.call_flow_templates ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can view templates" ON public.call_flow_templates;
    CREATE POLICY "Anyone can view templates"
      ON public.call_flow_templates FOR SELECT
      USING (true);
  `);
  console.log('   ✅ RLS call_flow_templates');

  console.log('\n🎉 Setup completo: Trigger + Seeds + RLS aplicados.');
  await sql.end();
  process.exit(0);
}

setup().catch((err) => {
  console.error('❌ Error en setup:', err.message);
  process.exit(1);
});
