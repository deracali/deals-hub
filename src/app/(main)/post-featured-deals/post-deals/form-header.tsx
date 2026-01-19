import Icon from "@/components/ui/icon";

const DealFormHeader = ({
  currentStep,
  totalSteps,
  onClose,
}: {
  currentStep: number;
  totalSteps: number;
  onClose: () => void;
}) => {
  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Icon name="Plus" size={20} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Submit a Deal
              </h1>
              <p className="text-sm text-muted-foreground">
                Share amazing deals with the community
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors focus-ring"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealFormHeader;
