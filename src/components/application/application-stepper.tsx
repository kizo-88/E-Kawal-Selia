import type { ReactNode } from 'react'
import { Button } from '../ui/button'
import { IconCheckCircle } from '../ui/icons'


export interface StepperStep {
  id: string
  number: number
  titleMs: string
  titleEn: string
  descriptionMs: string
  descriptionEn: string
}

export interface ApplicationStepperProps {
  steps: StepperStep[]
  currentStep: number
  onStepChange: (stepIndex: number) => void
  onSaveDraft?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onSubmit?: () => void
  isSubmitting?: boolean
  isDraftSaving?: boolean
  children: ReactNode
}

export function ApplicationStepper({
  steps,
  currentStep,
  onStepChange,
  onSaveDraft,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting = false,
  isDraftSaving = false,
  children,
}: ApplicationStepperProps) {
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="space-y-6 w-full">
      {/* Stepper Progress Header (M1-R02) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <nav aria-label="Aliran Peringkat Permohonan" className="w-full">
          <ol className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStep
              const isCurrent = idx === currentStep

              return (
                <li
                  key={step.id}
                  onClick={() => {
                    if (idx <= currentStep) onStepChange(idx)
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isCurrent
                      ? 'border-[#0b2545] bg-[#0b2545]/5 shadow-xs'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                        : 'border-slate-200 bg-slate-50/70 opacity-60'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCurrent
                        ? 'bg-[#0b2545] text-white'
                        : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <IconCheckCircle className="h-4 w-4" /> : step.number}
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`block text-xs font-bold truncate ${
                        isCurrent ? 'text-[#0b2545]' : isCompleted ? 'text-emerald-900' : 'text-slate-600'
                      }`}
                    >
                      {step.titleMs}
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate">
                      {step.descriptionMs}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      {/* Step Form Content */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        {children}

        {/* Stepper Navigation Actions Toolbar (M1-R03) */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onSaveDraft ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onSaveDraft}
                isLoading={isDraftSaving}
                className="w-full sm:w-auto text-xs font-bold"
              >
                Simpan Sebagai Draf (M1-R03)
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isFirstStep && onPrevious ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onPrevious}
                className="w-full sm:w-auto text-xs"
              >
                Sebelumnya
              </Button>
            ) : null}

            {!isLastStep && onNext ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={onNext}
                className="w-full sm:w-auto text-xs font-bold"
              >
                Seterusnya
              </Button>
            ) : null}

            {isLastStep && onSubmit ? (
              <Button
                type="button"
                variant="gold"
                size="md"
                onClick={onSubmit}
                isLoading={isSubmitting}
                className="w-full sm:w-auto text-xs font-bold shadow-md"
                leadingIcon={<IconCheckCircle className="h-4 w-4" />}
              >
                Hantar Permohonan Rasmi
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
