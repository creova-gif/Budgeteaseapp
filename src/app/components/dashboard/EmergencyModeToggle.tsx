import { motion } from 'motion/react';
import { Shield, AlertTriangle } from 'lucide-react';
import { useApp } from '@/app/App';
import { Switch } from '@/app/components/ui/switch';

export function EmergencyModeToggle() {
  const { state, toggleEmergencyMode } = useApp();
  const lang = state.language;

  return (
    <motion.div
      className={`rounded-2xl p-5 border-2 transition-all ${
        state.emergencyMode
          ? 'bg-orange-50 border-orange-300'
          : 'bg-white border-gray-200'
      }`}
      animate={{
        scale: state.emergencyMode ? [1, 1.02, 1] : 1,
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              state.emergencyMode ? 'bg-orange-200' : 'bg-gray-100'
            }`}
          >
            {state.emergencyMode ? (
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            ) : (
              <Shield className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {lang === 'sw' ? 'Hali ya Dharura' : 'Emergency Mode'}
            </h3>
            <p className="text-sm text-gray-600">
              {state.emergencyMode
                ? lang === 'sw'
                  ? 'Imeamilishwa - Matumizi muhimu tu'
                  : 'Active - Essential spending only'
                : lang === 'sw'
                ? 'Imelemewa'
                : 'Disabled'}
            </p>
          </div>
        </div>
        <Switch checked={state.emergencyMode} onCheckedChange={toggleEmergencyMode} />
      </div>

      {state.emergencyMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pt-3 border-t border-orange-200"
        >
          <p className="text-sm text-orange-800">
            {lang === 'sw'
              ? '🛡️ Bajeti zimesitishwa. Fuatilia matumizi ya dharura tu (chakula, dawa, usafiri muhimu).'
              : '🛡️ Budgets paused. Track only emergency expenses (food, medicine, essential transport).'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}