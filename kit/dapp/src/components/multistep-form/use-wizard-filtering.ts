import { useCallback, useMemo } from "react";
import type { FieldDefinition, FieldGroup, StepDefinition } from "./types";

interface UseWizardFilteringParams<TFormData> {
  currentStep: StepDefinition<TFormData> | undefined;
  formValues: Partial<TFormData>;
  searchQuery: string;
  selectedGroupIds: string[];
}

interface UseWizardFilteringResult<TFormData> {
  matchingFields: FieldDefinition<TFormData>[];
  matchingGroups: FieldGroup<TFormData>[];
  totalResultCount: number;
  groupCounts: Record<string, number>;
  matchFieldToQuery: (
    field: FieldDefinition<TFormData>,
    query: string
  ) => FieldDefinition<TFormData> | null;
}

export function useWizardFiltering<TFormData = unknown>({
  currentStep,
  formValues,
  searchQuery,
  selectedGroupIds,
}: UseWizardFilteringParams<TFormData>): UseWizardFilteringResult<TFormData> {
  // Search matching function
  const matchFieldToQuery = useCallback(
    (
      field: FieldDefinition<TFormData>,
      query: string
    ): FieldDefinition<TFormData> | null => {
      if (!query.trim()) return field;

      const queryLower = query.toLowerCase();
      const searchableText = [field.name as string, field.label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // Early return for fields without options
      if (!field.options?.length) {
        return searchableText.includes(queryLower) ? field : null;
      }

      // Filter options for fields that have them
      const matchingOptions = field.options.filter((option) => {
        const optionText = [option.label, option.value]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return optionText.includes(queryLower);
      });

      // Return field with matching options
      if (matchingOptions.length > 0) {
        return { ...field, options: matchingOptions };
      }

      // Or do a field level search
      return searchableText.includes(queryLower) ? field : null;
    },
    []
  );

  const isFieldDefined = useCallback(
    (field: FieldDefinition<TFormData> | undefined | null) => {
      return field !== undefined && field !== null;
    },
    []
  );

  const hasVisibleFields = useCallback(
    (group: FieldGroup<TFormData> | undefined | null) => {
      return group?.fields.some(isFieldDefined);
    },
    [isFieldDefined]
  );

  // Helper function to search regular fields
  const searchFields = useCallback(
    (
      fields: FieldDefinition<TFormData>[] | undefined,
      searchQuery: string
    ): FieldDefinition<TFormData>[] => {
      if (!fields) return [];

      return fields
        .map((field) => matchFieldToQuery(field, searchQuery))
        .filter(isFieldDefined);
    },
    [matchFieldToQuery, isFieldDefined]
  );

  // Helper function to search groups
  const searchGroups = useCallback(
    (
      groups: FieldGroup<TFormData>[],
      searchQuery: string
    ): FieldGroup<TFormData>[] => {
      return groups
        .map((group) => ({
          ...group,
          fields: group.fields
            .map((field) => matchFieldToQuery(field, searchQuery))
            .filter(isFieldDefined),
        }))
        .filter(hasVisibleFields);
    },
    [matchFieldToQuery, isFieldDefined, hasVisibleFields]
  );

  // Calculate group counts for the filter UI
  const calculateGroupCounts = useCallback(
    (
      groups: FieldGroup<TFormData>[],
      searchQuery: string
    ): Record<string, number> => {
      const counts: Record<string, number> = {};

      groups.forEach((group) => {
        const fieldsWithSearch = group.fields
          .map((field) => matchFieldToQuery(field, searchQuery))
          .filter(
            (field): field is FieldDefinition<TFormData> => field !== null
          );

        // Count the total number of options/items in this group
        const totalCount = fieldsWithSearch.reduce((acc, field) => {
          // If field has options, count the options; otherwise count the field itself
          return acc + (field.options?.length ?? 1);
        }, 0);

        counts[group.id] = totalCount;
      });

      return counts;
    },
    [matchFieldToQuery]
  );

  // Filter fields and groups based on search query and selected groups
  const { matchingFields, matchingGroups, totalResultCount, groupCounts } =
    useMemo(() => {
      if (!currentStep) {
        return {
          matchingFields: [],
          matchingGroups: [],
          totalResultCount: 0,
          groupCounts: {},
        };
      }

      // Get fields from step (may be static or dynamic based on form values)
      const allFields =
        typeof currentStep.fields === "function"
          ? currentStep.fields(formValues)
          : currentStep.fields;

      // Get groups from step (may be static or dynamic based on form values)
      const allGroups =
        currentStep.groups && typeof currentStep.groups === "function"
          ? currentStep.groups(formValues)
          : (currentStep.groups ?? []);

      // Calculate counts for all groups for the UI
      const groupCounts = calculateGroupCounts(allGroups, searchQuery);

      // Apply group selection filter
      const filteredGroups =
        selectedGroupIds.length > 0
          ? allGroups.filter((group) => selectedGroupIds.includes(group.id))
          : allGroups;

      // Apply search
      const matchingFields = searchFields(allFields, searchQuery);
      const matchingGroups = searchGroups(filteredGroups, searchQuery);

      // Calculate total result count
      const totalMatchingFields = [
        ...matchingFields,
        ...matchingGroups.flatMap((group) => group.fields),
      ];
      const totalResultCount = totalMatchingFields.length;

      return {
        matchingFields,
        matchingGroups,
        totalResultCount,
        groupCounts,
      };
    }, [
      currentStep,
      formValues,
      searchQuery,
      selectedGroupIds,
      searchFields,
      searchGroups,
      calculateGroupCounts,
    ]);

  return {
    matchingFields,
    matchingGroups,
    totalResultCount,
    groupCounts,
    matchFieldToQuery,
  };
}
