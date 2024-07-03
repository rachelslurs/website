import { Fragment, useEffect, useRef, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useDebouncedCallback } from "use-debounce";
import { AnimatePresence, motion } from "framer-motion";

import Device from "./Device.tsx";
import Container from "@components/Container.tsx";

type FeatureProps = {
  src: string;
  alt: string;
  caption: string;
};

function usePrevious<T>(value: T) {
  let ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

type FeaturesProps = {
  features: FeatureProps[];
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function FeaturesDesktop(props: FeaturesProps) {
  const { features } = props;
  let [changeCount, setChangeCount] = useState(0);
  let [selectedIndex, setSelectedIndex] = useState(0);
  let prevIndex = usePrevious(selectedIndex);
  let isForwards = prevIndex === undefined ? true : selectedIndex > prevIndex;

  let onChange = useDebouncedCallback(
    selectedIndex => {
      setSelectedIndex(selectedIndex);
      setChangeCount(changeCount => changeCount + 1);
    },
    100,
    { leading: true }
  );

  return (
    <TabGroup
      className="grid grid-cols-12 items-center gap-8 lg:gap-16 xl:gap-24"
      selectedIndex={selectedIndex}
      onChange={onChange}
      vertical
    >
      <TabList className="relative z-10 order-last col-span-6 space-y-6">
        {features.map((feature, featureIndex) => (
          <div
            className="relative rounded-2xl bg-skin-card-muted text-skin-base transition-colors hover:border-dashed hover:border-skin-accent"
            key={featureIndex}
          >
            {featureIndex === selectedIndex && (
              <motion.div
                layoutId="activeBackground"
                className="absolute inset-2 bg-skin-card text-skin-inverted"
                initial={{ borderRadius: 16 }}
              />
            )}

            <div className="relative z-10">
              <Tab className="text-left ui-not-focus-visible:outline-none p-8 w-full">
                {({ selected }) => (
                  <div className="group rounded-2xl transition-colors hover:bg-skin-base">
                    <p className="text-left ui-not-focus-visible:outline-none">
                      {feature.caption}
                    </p>
                  </div>
                )}
              </Tab>
            </div>
          </div>
        ))}
      </TabList>
      <div className="relative col-span-6">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="animate-spin-slower">Hello</p>
        </div>
        <Device>
          <TabPanels as={Fragment}>
            <AnimatePresence
              initial={false}
              custom={{ isForwards, changeCount }}
            >
              {features.map((feature, featureIndex) =>
                selectedIndex === featureIndex ? (
                  <TabPanel
                    key={featureIndex}
                    static
                    className="col-start-1 row-start-1 flex focus:outline-offset-[32px] ui-not-focus-visible:outline-none"
                  >
                    <img src={feature.src} alt={feature.alt} />
                  </TabPanel>
                ) : null
              )}
            </AnimatePresence>
          </TabPanels>
        </Device>
      </div>
    </TabGroup>
  );
}

function FeaturesMobile(props: FeaturesProps) {
  const { features } = props;
  let [activeIndex, setActiveIndex] = useState(0);
  let slideContainerRef = useRef<React.ElementRef<"div">>(null);
  let slideRefs = useRef<Array<React.ElementRef<"div">>>([]);

  useEffect(() => {
    let observer = new window.IntersectionObserver(
      entries => {
        for (let entry of entries) {
          if (entry.isIntersecting && entry.target instanceof HTMLDivElement) {
            setActiveIndex(slideRefs.current.indexOf(entry.target));
            break;
          }
        }
      },
      {
        root: slideContainerRef.current,
        threshold: 0.6,
      }
    );

    for (let slide of slideRefs.current) {
      if (slide) {
        observer.observe(slide);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [slideContainerRef, slideRefs]);

  return (
    <>
      <div
        ref={slideContainerRef}
        className="-mb-4 flex snap-x snap-mandatory -space-x-0 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] sm:-space-x-6 [&::-webkit-scrollbar]:hidden"
      >
        {features.map((feature, featureIndex) => (
          <div
            key={featureIndex}
            ref={ref => ref && (slideRefs.current[featureIndex] = ref)}
            className="w-full flex-none snap-center"
          >
            <div className="relative transform overflow-hidden p-0">
              <Device className="relative mx-auto w-full max-w-[366px]">
                <img src={feature.src} alt={feature.alt} />
              </Device>
              <div className="text-skin-base p-4">
                <p className="text-center ui-not-focus-visible:outline-none">
                  {feature.caption}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        {features.map((_, featureIndex) => (
          <button
            type="button"
            key={featureIndex}
            className={classNames(
              "relative h-0.5 w-4 rounded-full",
              featureIndex === activeIndex
                ? "bg-skin-accent"
                : "bg-skin-card-muted"
            )}
            aria-label={`Go to feature ${featureIndex + 1}`}
            onClick={() => {
              slideRefs.current[featureIndex].scrollIntoView({
                block: "nearest",
                inline: "nearest",
              });
            }}
          >
            <span className="absolute -inset-x-1.5 -inset-y-3" />
          </button>
        ))}
      </div>
    </>
  );
}

export default function PrimaryFeatures(props: FeaturesProps) {
  const { features } = props;
  return (
    <section id="features" aria-label="Features">
      <Container className="my-8 sm:hidden">
        <FeaturesMobile features={features} />
      </Container>
      <Container className="hidden sm:my-12 sm:block">
        <FeaturesDesktop features={features} />
      </Container>
    </section>
  );
}
